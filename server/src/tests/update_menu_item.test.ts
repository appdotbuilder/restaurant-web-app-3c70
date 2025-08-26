import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuItemsTable } from '../db/schema';
import { type UpdateMenuItemInput, type CreateMenuItemInput } from '../schema';
import { updateMenuItem, deleteMenuItem } from '../handlers/update_menu_item';
import { eq } from 'drizzle-orm';

// Test input for creating a base menu item
const testMenuItemInput: CreateMenuItemInput = {
  name: 'Test Burger',
  description: 'A delicious test burger',
  category: 'food',
  price: 15.99,
  image_url: 'https://example.com/burger.jpg'
};

// Helper function to create a test menu item
const createTestMenuItem = async () => {
  const result = await db.insert(menuItemsTable)
    .values({
      name: testMenuItemInput.name,
      description: testMenuItemInput.description,
      category: testMenuItemInput.category,
      price: testMenuItemInput.price.toString(),
      image_url: testMenuItemInput.image_url
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateMenuItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a menu item with all fields', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const updateInput: UpdateMenuItemInput = {
      id: createdItem.id,
      name: 'Updated Burger',
      description: 'An updated delicious burger',
      category: 'food',
      price: 18.99,
      image_url: 'https://example.com/updated-burger.jpg'
    };

    const result = await updateMenuItem(updateInput);

    // Verify the update was successful
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.name).toEqual('Updated Burger');
    expect(result!.description).toEqual('An updated delicious burger');
    expect(result!.category).toEqual('food');
    expect(result!.price).toEqual(18.99);
    expect(typeof result!.price).toBe('number');
    expect(result!.image_url).toEqual('https://example.com/updated-burger.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update a menu item with partial fields', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const updateInput: UpdateMenuItemInput = {
      id: createdItem.id,
      name: 'Partially Updated Burger',
      price: 22.50
    };

    const result = await updateMenuItem(updateInput);

    // Verify only specified fields were updated
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.name).toEqual('Partially Updated Burger');
    expect(result!.description).toEqual(testMenuItemInput.description); // Should remain unchanged
    expect(result!.category).toEqual(testMenuItemInput.category); // Should remain unchanged
    expect(result!.price).toEqual(22.50);
    expect(typeof result!.price).toBe('number');
    expect(result!.image_url).toEqual(testMenuItemInput.image_url); // Should remain unchanged
  });

  it('should handle nullable fields correctly', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const updateInput: UpdateMenuItemInput = {
      id: createdItem.id,
      description: null,
      image_url: null
    };

    const result = await updateMenuItem(updateInput);

    // Verify nullable fields were set to null
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.description).toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.name).toEqual(testMenuItemInput.name); // Should remain unchanged
  });

  it('should save updates to database', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const updateInput: UpdateMenuItemInput = {
      id: createdItem.id,
      name: 'Database Updated Burger',
      price: 25.00
    };

    await updateMenuItem(updateInput);

    // Query the database directly to verify changes
    const dbItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, createdItem.id))
      .execute();

    expect(dbItems).toHaveLength(1);
    expect(dbItems[0].name).toEqual('Database Updated Burger');
    expect(parseFloat(dbItems[0].price)).toEqual(25.00);
    expect(dbItems[0].description).toEqual(testMenuItemInput.description);
  });

  it('should return null for non-existent menu item', async () => {
    const updateInput: UpdateMenuItemInput = {
      id: 99999, // Non-existent ID
      name: 'Non-existent Item'
    };

    const result = await updateMenuItem(updateInput);

    expect(result).toBeNull();
  });

  it('should return existing item when no fields to update', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const updateInput: UpdateMenuItemInput = {
      id: createdItem.id
      // No fields to update
    };

    const result = await updateMenuItem(updateInput);

    // Should return the existing item unchanged
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.name).toEqual(testMenuItemInput.name);
    expect(result!.price).toEqual(testMenuItemInput.price);
    expect(typeof result!.price).toBe('number');
  });

  it('should handle different categories correctly', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const updateInput: UpdateMenuItemInput = {
      id: createdItem.id,
      category: 'drinks'
    };

    const result = await updateMenuItem(updateInput);

    expect(result).toBeDefined();
    expect(result!.category).toEqual('drinks');
  });
});

describe('deleteMenuItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing menu item', async () => {
    // Create a test menu item first
    const createdItem = await createTestMenuItem();

    const result = await deleteMenuItem(createdItem.id);

    expect(result).toBe(true);

    // Verify the item was deleted from database
    const dbItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, createdItem.id))
      .execute();

    expect(dbItems).toHaveLength(0);
  });

  it('should return false for non-existent menu item', async () => {
    const result = await deleteMenuItem(99999); // Non-existent ID

    expect(result).toBe(false);
  });

  it('should not affect other menu items when deleting', async () => {
    // Create multiple test menu items
    const item1 = await createTestMenuItem();
    
    const item2 = await db.insert(menuItemsTable)
      .values({
        name: 'Second Item',
        description: 'Another test item',
        category: 'drinks',
        price: '10.50',
        image_url: null
      })
      .returning()
      .execute();

    const item2Id = item2[0].id;

    // Delete the first item
    const result = await deleteMenuItem(item1.id);

    expect(result).toBe(true);

    // Verify only the first item was deleted
    const remainingItems = await db.select()
      .from(menuItemsTable)
      .execute();

    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].id).toEqual(item2Id);
    expect(remainingItems[0].name).toEqual('Second Item');
  });

  it('should handle multiple deletions correctly', async () => {
    // Create multiple test menu items
    const item1 = await createTestMenuItem();
    
    const item2 = await db.insert(menuItemsTable)
      .values({
        name: 'Second Item',
        description: 'Another test item',
        category: 'packages',
        price: '50.00',
        image_url: 'https://example.com/package.jpg'
      })
      .returning()
      .execute();

    // Delete both items
    const result1 = await deleteMenuItem(item1.id);
    const result2 = await deleteMenuItem(item2[0].id);

    expect(result1).toBe(true);
    expect(result2).toBe(true);

    // Verify all items were deleted
    const remainingItems = await db.select()
      .from(menuItemsTable)
      .execute();

    expect(remainingItems).toHaveLength(0);
  });
});