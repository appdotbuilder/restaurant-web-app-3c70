import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuItemsTable } from '../db/schema';
import { type CreateMenuItemInput } from '../schema';
import { createMenuItem } from '../handlers/create_menu_item';
import { eq } from 'drizzle-orm';

// Test inputs for different categories and scenarios
const testInputFood: CreateMenuItemInput = {
  name: 'Grilled Chicken',
  description: 'Juicy grilled chicken with herbs',
  category: 'food',
  price: 15.99,
  image_url: 'https://example.com/chicken.jpg'
};

const testInputDrink: CreateMenuItemInput = {
  name: 'Fresh Lemonade',
  description: 'Refreshing homemade lemonade',
  category: 'drinks',
  price: 4.50,
  image_url: null
};

const testInputPackage: CreateMenuItemInput = {
  name: 'Family Combo',
  description: null,
  category: 'packages',
  price: 45.00,
  image_url: 'https://example.com/combo.jpg'
};

describe('createMenuItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a food menu item', async () => {
    const result = await createMenuItem(testInputFood);

    // Basic field validation
    expect(result.name).toEqual('Grilled Chicken');
    expect(result.description).toEqual('Juicy grilled chicken with herbs');
    expect(result.category).toEqual('food');
    expect(result.price).toEqual(15.99);
    expect(typeof result.price).toBe('number');
    expect(result.image_url).toEqual('https://example.com/chicken.jpg');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a drink menu item with null description', async () => {
    const result = await createMenuItem(testInputDrink);

    expect(result.name).toEqual('Fresh Lemonade');
    expect(result.description).toEqual('Refreshing homemade lemonade');
    expect(result.category).toEqual('drinks');
    expect(result.price).toEqual(4.50);
    expect(result.image_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a package menu item with null description', async () => {
    const result = await createMenuItem(testInputPackage);

    expect(result.name).toEqual('Family Combo');
    expect(result.description).toBeNull();
    expect(result.category).toEqual('packages');
    expect(result.price).toEqual(45.00);
    expect(result.image_url).toEqual('https://example.com/combo.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save menu item to database', async () => {
    const result = await createMenuItem(testInputFood);

    // Query using proper drizzle syntax
    const menuItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, result.id))
      .execute();

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].name).toEqual('Grilled Chicken');
    expect(menuItems[0].description).toEqual('Juicy grilled chicken with herbs');
    expect(menuItems[0].category).toEqual('food');
    expect(parseFloat(menuItems[0].price)).toEqual(15.99);
    expect(menuItems[0].image_url).toEqual('https://example.com/chicken.jpg');
    expect(menuItems[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle decimal prices correctly', async () => {
    const inputWithDecimal: CreateMenuItemInput = {
      name: 'Expensive Item',
      description: 'A very expensive menu item',
      category: 'food',
      price: 99.95,
      image_url: null
    };

    const result = await createMenuItem(inputWithDecimal);

    expect(result.price).toEqual(99.95);
    expect(typeof result.price).toBe('number');

    // Verify in database
    const menuItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, result.id))
      .execute();

    expect(parseFloat(menuItems[0].price)).toEqual(99.95);
  });

  it('should create multiple menu items with unique IDs', async () => {
    const result1 = await createMenuItem(testInputFood);
    const result2 = await createMenuItem(testInputDrink);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('Grilled Chicken');
    expect(result2.name).toEqual('Fresh Lemonade');

    // Verify both exist in database
    const allMenuItems = await db.select()
      .from(menuItemsTable)
      .execute();

    expect(allMenuItems).toHaveLength(2);
    const names = allMenuItems.map(item => item.name);
    expect(names).toContain('Grilled Chicken');
    expect(names).toContain('Fresh Lemonade');
  });

  it('should handle all category types correctly', async () => {
    const foodResult = await createMenuItem(testInputFood);
    const drinkResult = await createMenuItem(testInputDrink);
    const packageResult = await createMenuItem(testInputPackage);

    expect(foodResult.category).toEqual('food');
    expect(drinkResult.category).toEqual('drinks');
    expect(packageResult.category).toEqual('packages');

    // Verify in database
    const allMenuItems = await db.select()
      .from(menuItemsTable)
      .execute();

    expect(allMenuItems).toHaveLength(3);
    const categories = allMenuItems.map(item => item.category);
    expect(categories).toContain('food');
    expect(categories).toContain('drinks');
    expect(categories).toContain('packages');
  });
});