import { db } from '../db';
import { menuItemsTable } from '../db/schema';
import { type UpdateMenuItemInput, type MenuItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMenuItem = async (input: UpdateMenuItemInput): Promise<MenuItem | null> => {
  try {
    // First check if the menu item exists
    const existingItem = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, input.id))
      .execute();

    if (existingItem.length === 0) {
      return null;
    }

    // Build the update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    
    if (input.price !== undefined) {
      updateData.price = input.price.toString(); // Convert number to string for numeric column
    }
    
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }

    // If no fields to update, return the existing item
    if (Object.keys(updateData).length === 0) {
      const item = existingItem[0];
      return {
        ...item,
        price: parseFloat(item.price) // Convert string back to number
      };
    }

    // Update the menu item
    const result = await db.update(menuItemsTable)
      .set(updateData)
      .where(eq(menuItemsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const menuItem = result[0];
    return {
      ...menuItem,
      price: parseFloat(menuItem.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Menu item update failed:', error);
    throw error;
  }
};

export const deleteMenuItem = async (id: number): Promise<boolean> => {
  try {
    // Delete the menu item
    const result = await db.delete(menuItemsTable)
      .where(eq(menuItemsTable.id, id))
      .returning()
      .execute();

    return result.length > 0;
  } catch (error) {
    console.error('Menu item deletion failed:', error);
    throw error;
  }
};