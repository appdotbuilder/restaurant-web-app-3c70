import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type UpdateOrderStatusInput, type Order } from '../schema';
import { eq } from 'drizzle-orm';

export const updateOrderStatus = async (input: UpdateOrderStatusInput): Promise<Order | null> => {
  try {
    // Update the order status
    const result = await db.update(ordersTable)
      .set({ status: input.status })
      .where(eq(ordersTable.id, input.id))
      .returning()
      .execute();

    // If no rows were updated, the order doesn't exist
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers and cast items properly
    const order = result[0];
    return {
      ...order,
      total_amount: parseFloat(order.total_amount), // Convert string back to number
      items: order.items as { menu_item_id: number; quantity: number; }[] // Cast items to proper type
    };
  } catch (error) {
    console.error('Order status update failed:', error);
    throw error;
  }
};