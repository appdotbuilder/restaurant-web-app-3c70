import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type UpdateOrderStatusInput, type CreateOrderInput } from '../schema';
import { updateOrderStatus } from '../handlers/update_order';
import { eq } from 'drizzle-orm';

// Test data for creating orders
const testOrderInput: CreateOrderInput = {
  customer_name: 'John Doe',
  customer_phone: '+1234567890',
  items: [
    { menu_item_id: 1, quantity: 2 },
    { menu_item_id: 2, quantity: 1 }
  ],
  total_amount: 29.99
};

// Helper function to create a test order in the database
const createTestOrder = async () => {
  const result = await db.insert(ordersTable)
    .values({
      customer_name: testOrderInput.customer_name,
      customer_phone: testOrderInput.customer_phone,
      items: JSON.stringify(testOrderInput.items),
      total_amount: testOrderInput.total_amount.toString(),
      status: 'pending'
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateOrderStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update order status successfully', async () => {
    // Create a test order first
    const createdOrder = await createTestOrder();
    
    const updateInput: UpdateOrderStatusInput = {
      id: createdOrder.id,
      status: 'confirmed'
    };

    const result = await updateOrderStatus(updateInput);

    // Verify the returned order
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdOrder.id);
    expect(result!.status).toEqual('confirmed');
    expect(result!.customer_name).toEqual('John Doe');
    expect(result!.customer_phone).toEqual('+1234567890');
    expect(result!.total_amount).toEqual(29.99);
    expect(typeof result!.total_amount).toEqual('number');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.items).toEqual(testOrderInput.items);
  });

  it('should save updated status to database', async () => {
    // Create a test order first
    const createdOrder = await createTestOrder();
    
    const updateInput: UpdateOrderStatusInput = {
      id: createdOrder.id,
      status: 'preparing'
    };

    await updateOrderStatus(updateInput);

    // Query the database to verify the update
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, createdOrder.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].status).toEqual('preparing');
    expect(orders[0].customer_name).toEqual('John Doe');
    expect(parseFloat(orders[0].total_amount)).toEqual(29.99);
  });

  it('should return null for non-existent order', async () => {
    const updateInput: UpdateOrderStatusInput = {
      id: 999, // Non-existent order ID
      status: 'confirmed'
    };

    const result = await updateOrderStatus(updateInput);

    expect(result).toBeNull();
  });

  it('should update status through multiple transitions', async () => {
    // Create a test order first
    const createdOrder = await createTestOrder();
    
    // First transition: pending -> confirmed
    const firstUpdate: UpdateOrderStatusInput = {
      id: createdOrder.id,
      status: 'confirmed'
    };

    const firstResult = await updateOrderStatus(firstUpdate);
    expect(firstResult!.status).toEqual('confirmed');

    // Second transition: confirmed -> preparing
    const secondUpdate: UpdateOrderStatusInput = {
      id: createdOrder.id,
      status: 'preparing'
    };

    const secondResult = await updateOrderStatus(secondUpdate);
    expect(secondResult!.status).toEqual('preparing');

    // Third transition: preparing -> ready
    const thirdUpdate: UpdateOrderStatusInput = {
      id: createdOrder.id,
      status: 'ready'
    };

    const thirdResult = await updateOrderStatus(thirdUpdate);
    expect(thirdResult!.status).toEqual('ready');

    // Verify final state in database
    const finalOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, createdOrder.id))
      .execute();

    expect(finalOrder[0].status).toEqual('ready');
  });

  it('should handle all valid order statuses', async () => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;
    
    for (const status of validStatuses) {
      // Create a test order for each status
      const createdOrder = await createTestOrder();
      
      const updateInput: UpdateOrderStatusInput = {
        id: createdOrder.id,
        status: status
      };

      const result = await updateOrderStatus(updateInput);

      expect(result).not.toBeNull();
      expect(result!.status).toEqual(status);
      expect(result!.id).toEqual(createdOrder.id);
    }
  });

  it('should preserve all other order fields when updating status', async () => {
    // Create a test order first
    const createdOrder = await createTestOrder();
    
    const updateInput: UpdateOrderStatusInput = {
      id: createdOrder.id,
      status: 'completed'
    };

    const result = await updateOrderStatus(updateInput);

    // Verify all fields are preserved except status
    expect(result!.id).toEqual(createdOrder.id);
    expect(result!.customer_name).toEqual(createdOrder.customer_name);
    expect(result!.customer_phone).toEqual(createdOrder.customer_phone);
    expect(result!.total_amount).toEqual(parseFloat(createdOrder.total_amount));
    expect(result!.items).toEqual(createdOrder.items as { menu_item_id: number; quantity: number; }[]); // items are already parsed from JSONB
    expect(result!.created_at).toEqual(createdOrder.created_at);
    expect(result!.status).toEqual('completed'); // Only status should change
  });
});