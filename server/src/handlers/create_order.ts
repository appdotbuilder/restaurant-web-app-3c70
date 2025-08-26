import { db } from '../db';
import { ordersTable, menuItemsTable } from '../db/schema';
import { type CreateOrderInput, type Order } from '../schema';
import { eq, inArray } from 'drizzle-orm';

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  try {
    // Extract all menu item IDs from the order
    const menuItemIds = input.items.map(item => item.menu_item_id);
    
    // Verify all menu items exist
    const existingItems = await db.select()
      .from(menuItemsTable)
      .where(inArray(menuItemsTable.id, menuItemIds))
      .execute();

    if (existingItems.length !== menuItemIds.length) {
      throw new Error('One or more menu items do not exist');
    }

    // Insert order record
    const result = await db.insert(ordersTable)
      .values({
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        items: input.items, // JSON field - stored as-is
        total_amount: input.total_amount.toString(), // Convert number to string for numeric column
        status: 'pending' // Default status
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers and cast JSON field
    const order = result[0];
    return {
      ...order,
      items: order.items as { menu_item_id: number; quantity: number; }[], // Cast JSON field
      total_amount: parseFloat(order.total_amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};