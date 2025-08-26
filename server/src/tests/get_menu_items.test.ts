import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuItemsTable } from '../db/schema';
import { type CreateMenuItemInput } from '../schema';
import { getMenuItems, getMenuItemsByCategory, getMenuItemById } from '../handlers/get_menu_items';

// Test data for menu items
const testMenuItems: CreateMenuItemInput[] = [
  {
    name: 'Pasta Carbonara',
    description: 'Classic Italian pasta with eggs, cheese, and bacon',
    category: 'food',
    price: 12.99,
    image_url: null
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing',
    category: 'food',
    price: 8.50,
    image_url: 'https://example.com/caesar.jpg'
  },
  {
    name: 'Coca Cola',
    description: 'Refreshing soft drink',
    category: 'drinks',
    price: 2.50,
    image_url: null
  },
  {
    name: 'Orange Juice',
    description: null,
    category: 'drinks',
    price: 3.00,
    image_url: null
  },
  {
    name: 'Birthday Package',
    description: 'Complete birthday celebration package',
    category: 'packages',
    price: 99.99,
    image_url: null
  }
];

describe('getMenuItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('getMenuItems', () => {
    it('should return empty array when no menu items exist', async () => {
      const result = await getMenuItems();
      expect(result).toEqual([]);
    });

    it('should return all menu items ordered by category and name', async () => {
      // Insert test data
      await db.insert(menuItemsTable)
        .values(testMenuItems.map(item => ({
          ...item,
          price: item.price.toString() // Convert number to string for numeric column
        })))
        .execute();

      const result = await getMenuItems();

      // Should return all 5 items
      expect(result).toHaveLength(5);

      // Verify ordering by category first (enum order: food, drinks, packages), then name
      expect(result[0].category).toEqual('food');
      expect(result[0].name).toEqual('Caesar Salad');
      expect(result[1].category).toEqual('food');
      expect(result[1].name).toEqual('Pasta Carbonara');
      expect(result[2].category).toEqual('drinks');
      expect(result[2].name).toEqual('Coca Cola');
      expect(result[3].category).toEqual('drinks');
      expect(result[3].name).toEqual('Orange Juice');
      expect(result[4].category).toEqual('packages');
      expect(result[4].name).toEqual('Birthday Package');

      // Verify numeric conversion
      expect(typeof result[0].price).toBe('number');
      expect(result[0].price).toEqual(8.50); // Caesar Salad price
      expect(result[2].price).toEqual(2.50); // Coca Cola price
    });

    it('should include all required fields', async () => {
      await db.insert(menuItemsTable)
        .values([{
          name: 'Test Item',
          description: 'Test description',
          category: 'food',
          price: '10.99',
          image_url: 'https://example.com/test.jpg'
        }])
        .execute();

      const result = await getMenuItems();

      expect(result).toHaveLength(1);
      const item = result[0];
      expect(item.id).toBeDefined();
      expect(item.name).toEqual('Test Item');
      expect(item.description).toEqual('Test description');
      expect(item.category).toEqual('food');
      expect(item.price).toEqual(10.99);
      expect(item.image_url).toEqual('https://example.com/test.jpg');
      expect(item.created_at).toBeInstanceOf(Date);
    });
  });

  describe('getMenuItemsByCategory', () => {
    beforeEach(async () => {
      // Insert test data before each test
      await db.insert(menuItemsTable)
        .values(testMenuItems.map(item => ({
          ...item,
          price: item.price.toString()
        })))
        .execute();
    });

    it('should return only food items ordered by name', async () => {
      const result = await getMenuItemsByCategory('food');

      expect(result).toHaveLength(2);
      expect(result[0].name).toEqual('Caesar Salad');
      expect(result[0].category).toEqual('food');
      expect(result[0].price).toEqual(8.50);
      expect(result[1].name).toEqual('Pasta Carbonara');
      expect(result[1].category).toEqual('food');
      expect(result[1].price).toEqual(12.99);
    });

    it('should return only drink items ordered by name', async () => {
      const result = await getMenuItemsByCategory('drinks');

      expect(result).toHaveLength(2);
      expect(result[0].name).toEqual('Coca Cola');
      expect(result[0].category).toEqual('drinks');
      expect(result[0].price).toEqual(2.50);
      expect(result[1].name).toEqual('Orange Juice');
      expect(result[1].category).toEqual('drinks');
      expect(result[1].price).toEqual(3.00);
    });

    it('should return only package items', async () => {
      const result = await getMenuItemsByCategory('packages');

      expect(result).toHaveLength(1);
      expect(result[0].name).toEqual('Birthday Package');
      expect(result[0].category).toEqual('packages');
      expect(result[0].price).toEqual(99.99);
    });

    it('should return empty array for category with no items', async () => {
      // Clear all items first
      await db.delete(menuItemsTable).execute();

      const result = await getMenuItemsByCategory('food');
      expect(result).toEqual([]);
    });

    it('should handle null descriptions correctly', async () => {
      const result = await getMenuItemsByCategory('drinks');

      const orangeJuice = result.find(item => item.name === 'Orange Juice');
      expect(orangeJuice).toBeDefined();
      expect(orangeJuice!.description).toBeNull();
    });
  });

  describe('getMenuItemById', () => {
    let insertedItemId: number;

    beforeEach(async () => {
      // Insert a test item and get its ID
      const result = await db.insert(menuItemsTable)
        .values({
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          category: 'food',
          price: '15.99',
          image_url: 'https://example.com/pizza.jpg'
        })
        .returning()
        .execute();
      
      insertedItemId = result[0].id;
    });

    it('should return menu item when id exists', async () => {
      const result = await getMenuItemById(insertedItemId);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(insertedItemId);
      expect(result!.name).toEqual('Test Pizza');
      expect(result!.description).toEqual('Delicious test pizza');
      expect(result!.category).toEqual('food');
      expect(result!.price).toEqual(15.99);
      expect(result!.image_url).toEqual('https://example.com/pizza.jpg');
      expect(result!.created_at).toBeInstanceOf(Date);

      // Verify numeric conversion
      expect(typeof result!.price).toBe('number');
    });

    it('should return null when id does not exist', async () => {
      const result = await getMenuItemById(99999);
      expect(result).toBeNull();
    });

    it('should handle item with null fields correctly', async () => {
      // Insert item with null description and image_url
      const result = await db.insert(menuItemsTable)
        .values({
          name: 'Simple Item',
          description: null,
          category: 'drinks',
          price: '5.00',
          image_url: null
        })
        .returning()
        .execute();

      const itemId = result[0].id;
      const fetchedItem = await getMenuItemById(itemId);

      expect(fetchedItem).not.toBeNull();
      expect(fetchedItem!.name).toEqual('Simple Item');
      expect(fetchedItem!.description).toBeNull();
      expect(fetchedItem!.image_url).toBeNull();
      expect(fetchedItem!.price).toEqual(5.00);
    });
  });
});