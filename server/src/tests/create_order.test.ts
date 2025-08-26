import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable, menuItemsTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

describe('createOrder', () => {
  let menuItem1Id: number;
  let menuItem2Id: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test menu items first
    const menuItems = await db.insert(menuItemsTable)
      .values([
        {
          name: 'Burger',
          description: 'Delicious burger',
          category: 'food',
          price: '12.99'
        },
        {
          name: 'Soda',
          description: 'Refreshing drink',
          category: 'drinks',
          price: '2.99'
        }
      ])
      .returning()
      .execute();
    
    menuItem1Id = menuItems[0].id;
    menuItem2Id = menuItems[1].id;
  });

  afterEach(resetDB);

  const testInput: CreateOrderInput = {
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    items: [
      { menu_item_id: 0, quantity: 2 }, // Will be set in tests
      { menu_item_id: 0, quantity: 1 }  // Will be set in tests
    ],
    total_amount: 28.97
  };

  it('should create an order with valid menu items', async () => {
    const input = {
      ...testInput,
      items: [
        { menu_item_id: menuItem1Id, quantity: 2 },
        { menu_item_id: menuItem2Id, quantity: 1 }
      ]
    };

    const result = await createOrder(input);

    // Basic field validation
    expect(result.customer_name).toEqual('John Doe');
    expect(result.customer_phone).toEqual('+1234567890');
    expect(result.items).toEqual(input.items);
    expect(result.total_amount).toEqual(28.97);
    expect(typeof result.total_amount).toEqual('number'); // Verify numeric conversion
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save order to database', async () => {
    const input = {
      ...testInput,
      items: [
        { menu_item_id: menuItem1Id, quantity: 1 },
        { menu_item_id: menuItem2Id, quantity: 2 }
      ]
    };

    const result = await createOrder(input);

    // Query database to verify order was saved
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    const savedOrder = orders[0];
    expect(savedOrder.customer_name).toEqual('John Doe');
    expect(savedOrder.customer_phone).toEqual('+1234567890');
    expect(savedOrder.items).toEqual(input.items);
    expect(parseFloat(savedOrder.total_amount)).toEqual(28.97);
    expect(savedOrder.status).toEqual('pending');
    expect(savedOrder.created_at).toBeInstanceOf(Date);
  });

  it('should handle single item order', async () => {
    const input: CreateOrderInput = {
      customer_name: 'Jane Smith',
      customer_phone: '+0987654321',
      items: [{ menu_item_id: menuItem1Id, quantity: 1 }],
      total_amount: 12.99
    };

    const result = await createOrder(input);

    expect(result.customer_name).toEqual('Jane Smith');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].menu_item_id).toEqual(menuItem1Id);
    expect(result.items[0].quantity).toEqual(1);
    expect(result.total_amount).toEqual(12.99);
  });

  it('should reject order with non-existent menu item', async () => {
    const input = {
      ...testInput,
      items: [
        { menu_item_id: 99999, quantity: 1 } // Non-existent menu item
      ]
    };

    await expect(createOrder(input)).rejects.toThrow(/do not exist/i);
  });

  it('should reject order with partially invalid menu items', async () => {
    const input = {
      ...testInput,
      items: [
        { menu_item_id: menuItem1Id, quantity: 1 }, // Valid
        { menu_item_id: 99999, quantity: 1 }        // Invalid
      ]
    };

    await expect(createOrder(input)).rejects.toThrow(/do not exist/i);

    // Verify no order was created
    const orders = await db.select().from(ordersTable).execute();
    expect(orders).toHaveLength(0);
  });

  it('should handle multiple quantities correctly', async () => {
    const input = {
      ...testInput,
      items: [
        { menu_item_id: menuItem1Id, quantity: 5 },
        { menu_item_id: menuItem2Id, quantity: 3 }
      ],
      total_amount: 73.92
    };

    const result = await createOrder(input);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].quantity).toEqual(5);
    expect(result.items[1].quantity).toEqual(3);
    expect(result.total_amount).toEqual(73.92);
  });

  it('should create order with different customer details', async () => {
    const input: CreateOrderInput = {
      customer_name: 'Alice Johnson',
      customer_phone: '+1122334455',
      items: [{ menu_item_id: menuItem2Id, quantity: 2 }],
      total_amount: 5.98
    };

    const result = await createOrder(input);

    expect(result.customer_name).toEqual('Alice Johnson');
    expect(result.customer_phone).toEqual('+1122334455');
    expect(result.total_amount).toEqual(5.98);
    expect(result.status).toEqual('pending');
  });

  it('should verify menu item validation works with all valid items', async () => {
    // Create additional menu item
    const extraItem = await db.insert(menuItemsTable)
      .values({
        name: 'Pizza',
        description: 'Tasty pizza',
        category: 'food',
        price: '15.99'
      })
      .returning()
      .execute();

    const input = {
      ...testInput,
      items: [
        { menu_item_id: menuItem1Id, quantity: 1 },
        { menu_item_id: menuItem2Id, quantity: 1 },
        { menu_item_id: extraItem[0].id, quantity: 1 }
      ],
      total_amount: 31.97
    };

    const result = await createOrder(input);

    expect(result.items).toHaveLength(3);
    expect(result.total_amount).toEqual(31.97);
    
    // Verify all items are stored correctly
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();
    
    expect(orders[0].items).toEqual(input.items);
  });
});