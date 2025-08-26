import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type Testimonial } from '../schema';
import { eq, gte, desc } from 'drizzle-orm';

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const results = await db.select()
      .from(testimonialsTable)
      .orderBy(desc(testimonialsTable.date))
      .execute();

    return results.map(testimonial => ({
      ...testimonial,
      // Convert the date field back to Date object for consistency with schema
      date: new Date(testimonial.date)
    }));
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    throw error;
  }
};

export const getTestimonialsByRating = async (minRating: number): Promise<Testimonial[]> => {
  try {
    const results = await db.select()
      .from(testimonialsTable)
      .where(gte(testimonialsTable.rating, minRating))
      .orderBy(desc(testimonialsTable.date))
      .execute();

    return results.map(testimonial => ({
      ...testimonial,
      // Convert the date field back to Date object for consistency with schema
      date: new Date(testimonial.date)
    }));
  } catch (error) {
    console.error('Failed to fetch testimonials by rating:', error);
    throw error;
  }
};

export const getTestimonialById = async (id: number): Promise<Testimonial | null> => {
  try {
    const results = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const testimonial = results[0];
    return {
      ...testimonial,
      // Convert the date field back to Date object for consistency with schema
      date: new Date(testimonial.date)
    };
  } catch (error) {
    console.error('Failed to fetch testimonial by ID:', error);
    throw error;
  }
};