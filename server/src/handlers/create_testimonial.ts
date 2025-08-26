import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput, type Testimonial } from '../schema';

export const createTestimonial = async (input: CreateTestimonialInput): Promise<Testimonial> => {
  try {
    // Set default date if not provided
    const testimonialDate = input.date || new Date();

    // Insert testimonial record
    const result = await db.insert(testimonialsTable)
      .values({
        customer_name: input.customer_name,
        review: input.review,
        rating: input.rating,
        date: testimonialDate
      })
      .returning()
      .execute();

    // Return the created testimonial (no numeric conversions needed for this table)
    return result[0];
  } catch (error) {
    console.error('Testimonial creation failed:', error);
    throw error;
  }
};