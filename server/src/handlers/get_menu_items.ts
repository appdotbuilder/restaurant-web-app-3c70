import { db } from '../db';
import { menuItemsTable } from '../db/schema';
import { type MenuItem } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const results = await db.select()
      .from(menuItemsTable)
      .orderBy(asc(menuItemsTable.category), asc(menuItemsTable.name))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    throw error;
  }
};

export const getMenuItemsByCategory = async (category: 'food' | 'drinks' | 'packages'): Promise<MenuItem[]> => {
  try {
    const results = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.category, category))
      .orderBy(asc(menuItemsTable.name))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch menu items by category:', error);
    throw error;
  }
};

export const getMenuItemById = async (id: number): Promise<MenuItem | null> => {
  try {
    const results = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const item = results[0];
    return {
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Failed to fetch menu item by id:', error);
    throw error;
  }
};