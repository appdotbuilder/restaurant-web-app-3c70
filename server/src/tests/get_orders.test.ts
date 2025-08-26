import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { getOrders, getOrdersByStatus, getOrderById } from '../handlers/get_orders';

// Test order data
const testOrder1: CreateOrderInput = {
  customer_name: 'John Doe',
  customer_phone: '+1234567890',
  items: [
    { menu_item_id: 1, quantity: 2 },
    { menu_item_id: 2, quantity: 1 }
  ],
  total_amount: 29.99
};

const testOrder2: CreateOrderInput = {
  customer_name: 'Jane Smith',
  customer_phone: '+1987654321',
  items: [
    { menu_item_id: 3, quantity: 1 }
  ],
  total_amount: 15.50
};

const testOrder3: CreateOrderInput = {
  customer_name: 'Bob Johnson',
  customer_phone: '+1555123456',
  items: [
    { menu_item_id: 1, quantity: 1 }
  ],
  total_amount: 12.99
};

describe('get_orders handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('getOrders', () => {
    it('should return empty array when no orders exist', async () => {
      const result = await getOrders();
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return all orders ordered by creation date (newest first)', async () => {
      // Create test orders
      await db.insert(ordersTable)
        .values([
          {
            ...testOrder1,
            total_amount: testOrder1.total_amount.toString(),
            items: JSON.stringify(testOrder1.items)
          },
          {
            ...testOrder2,
            total_amount: testOrder2.total_amount.toString(),
            items: JSON.stringify(testOrder2.items)
          },
          {
            ...testOrder3,
            total_amount: testOrder3.total_amount.toString(),
            items: JSON.stringify(testOrder3.items)
          }
        ])
        .execute();

      const result = await getOrders();

      expect(result).toHaveLength(3);
      
      // Verify all orders are returned
      const customerNames = result.map(order => order.customer_name);
      expect(customerNames).toContain('John Doe');
      expect(customerNames).toContain('Jane Smith');
      expect(customerNames).toContain('Bob Johnson');

      // Verify orders are sorted by creation date (newest first)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
      }

      // Verify numeric conversion
      result.forEach(order => {
        expect(typeof order.total_amount).toBe('number');
        expect(order.total_amount).toBeGreaterThan(0);
      });

      // Verify structure
      const firstOrder = result[0];
      expect(firstOrder.id).toBeDefined();
      expect(firstOrder.customer_name).toBeDefined();
      expect(firstOrder.customer_phone).toBeDefined();
      expect(firstOrder.items).toBeDefined();
      expect(firstOrder.status).toBeDefined();
      expect(firstOrder.created_at).toBeInstanceOf(Date);
    });

    it('should handle orders with different statuses', async () => {
      // Create orders with different statuses
      await db.insert(ordersTable)
        .values([
          {
            ...testOrder1,
            total_amount: testOrder1.total_amount.toString(),
            items: JSON.stringify(testOrder1.items),
            status: 'pending'
          },
          {
            ...testOrder2,
            total_amount: testOrder2.total_amount.toString(),
            items: JSON.stringify(testOrder2.items),
            status: 'confirmed'
          },
          {
            ...testOrder3,
            total_amount: testOrder3.total_amount.toString(),
            items: JSON.stringify(testOrder3.items),
            status: 'completed'
          }
        ])
        .execute();

      const result = await getOrders();

      expect(result).toHaveLength(3);
      
      const statuses = result.map(order => order.status);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('confirmed');
      expect(statuses).toContain('completed');
    });
  });

  describe('getOrdersByStatus', () => {
    beforeEach(async () => {
      // Create test orders with different statuses
      await db.insert(ordersTable)
        .values([
          {
            ...testOrder1,
            total_amount: testOrder1.total_amount.toString(),
            items: JSON.stringify(testOrder1.items),
            status: 'pending'
          },
          {
            ...testOrder2,
            total_amount: testOrder2.total_amount.toString(),
            items: JSON.stringify(testOrder2.items),
            status: 'confirmed'
          },
          {
            ...testOrder3,
            total_amount: testOrder3.total_amount.toString(),
            items: JSON.stringify(testOrder3.items),
            status: 'pending'
          }
        ])
        .execute();
    });

    it('should return orders with specific status', async () => {
      const pendingOrders = await getOrdersByStatus('pending');
      
      expect(pendingOrders).toHaveLength(2);
      pendingOrders.forEach(order => {
        expect(order.status).toBe('pending');
        expect(typeof order.total_amount).toBe('number');
      });

      const confirmedOrders = await getOrdersByStatus('confirmed');
      
      expect(confirmedOrders).toHaveLength(1);
      expect(confirmedOrders[0].status).toBe('confirmed');
      expect(confirmedOrders[0].customer_name).toBe('Jane Smith');
    });

    it('should return empty array when no orders match status', async () => {
      const completedOrders = await getOrdersByStatus('completed');
      
      expect(completedOrders).toEqual([]);
      expect(Array.isArray(completedOrders)).toBe(true);
    });

    it('should return orders ordered by creation date (newest first)', async () => {
      const pendingOrders = await getOrdersByStatus('pending');
      
      expect(pendingOrders).toHaveLength(2);
      
      // Verify orders are sorted by creation date (newest first)
      for (let i = 0; i < pendingOrders.length - 1; i++) {
        expect(pendingOrders[i].created_at >= pendingOrders[i + 1].created_at).toBe(true);
      }
    });

    it('should handle all valid order statuses', async () => {
      // Test each valid status
      const validStatuses: Array<'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'> = 
        ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

      for (const status of validStatuses) {
        const result = await getOrdersByStatus(status);
        expect(Array.isArray(result)).toBe(true);
        
        // Only pending orders exist in our test data
        if (status === 'pending') {
          expect(result.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('getOrderById', () => {
    let orderId: number;

    beforeEach(async () => {
      // Create a test order
      const result = await db.insert(ordersTable)
        .values({
          ...testOrder1,
          total_amount: testOrder1.total_amount.toString(),
          items: JSON.stringify(testOrder1.items)
        })
        .returning()
        .execute();
      
      orderId = result[0].id;
    });

    it('should return order when ID exists', async () => {
      const result = await getOrderById(orderId);
      
      expect(result).not.toBeNull();
      expect(result!.id).toBe(orderId);
      expect(result!.customer_name).toBe('John Doe');
      expect(result!.customer_phone).toBe('+1234567890');
      expect(result!.total_amount).toBe(29.99);
      expect(typeof result!.total_amount).toBe('number');
      expect(result!.status).toBe('pending');
      expect(result!.created_at).toBeInstanceOf(Date);
      
      // Verify items are properly stored as JSON
      expect(result!.items).toBeDefined();
      expect(Array.isArray(result!.items)).toBe(true);
    });

    it('should return null when ID does not exist', async () => {
      const result = await getOrderById(99999);
      
      expect(result).toBeNull();
    });

    it('should handle negative IDs gracefully', async () => {
      const result = await getOrderById(-1);
      
      expect(result).toBeNull();
    });

    it('should return the correct order when multiple orders exist', async () => {
      // Create additional orders
      const result2 = await db.insert(ordersTable)
        .values({
          ...testOrder2,
          total_amount: testOrder2.total_amount.toString(),
          items: JSON.stringify(testOrder2.items)
        })
        .returning()
        .execute();
      
      const orderId2 = result2[0].id;

      // Get the second order
      const order = await getOrderById(orderId2);
      
      expect(order).not.toBeNull();
      expect(order!.id).toBe(orderId2);
      expect(order!.customer_name).toBe('Jane Smith');
      expect(order!.total_amount).toBe(15.50);
    });
  });
});