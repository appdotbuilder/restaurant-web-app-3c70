import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type Order, type OrderItem } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getOrders = async (): Promise<Order[]> => {
  try {
    const results = await db.select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.created_at))
      .execute();

    // Convert numeric fields back to numbers and cast items to proper type
    return results.map(order => ({
      ...order,
      total_amount: parseFloat(order.total_amount),
      items: order.items as OrderItem[]
    }));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  try {
    const results = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.status, status))
      .orderBy(desc(ordersTable.created_at))
      .execute();

    // Convert numeric fields back to numbers and cast items to proper type
    return results.map(order => ({
      ...order,
      total_amount: parseFloat(order.total_amount),
      items: order.items as OrderItem[]
    }));
  } catch (error) {
    console.error('Failed to fetch orders by status:', error);
    throw error;
  }
};

export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    const results = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const order = results[0];
    return {
      ...order,
      total_amount: parseFloat(order.total_amount),
      items: order.items as OrderItem[]
    };
  } catch (error) {
    console.error('Failed to fetch order by ID:', error);
    throw error;
  }
};