import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type UpdateTestimonialInput, type Testimonial } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTestimonial = async (input: UpdateTestimonialInput): Promise<Testimonial | null> => {
  try {
    // Extract id and update fields
    const { id, ...updateFields } = input;

    // Check if testimonial exists first
    const existingTestimonial = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, id))
      .execute();

    if (existingTestimonial.length === 0) {
      return null;
    }

    // Update testimonial record
    const result = await db.update(testimonialsTable)
      .set(updateFields)
      .where(eq(testimonialsTable.id, id))
      .returning()
      .execute();

    // Convert date fields and return updated testimonial
    const testimonial = result[0];
    return {
      ...testimonial,
      date: new Date(testimonial.date),
      created_at: new Date(testimonial.created_at)
    };
  } catch (error) {
    console.error('Testimonial update failed:', error);
    throw error;
  }
};

export const deleteTestimonial = async (id: number): Promise<boolean> => {
  try {
    // Delete testimonial record
    const result = await db.delete(testimonialsTable)
      .where(eq(testimonialsTable.id, id))
      .returning()
      .execute();

    // Return true if a record was deleted, false otherwise
    return result.length > 0;
  } catch (error) {
    console.error('Testimonial deletion failed:', error);
    throw error;
  }
};