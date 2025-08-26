import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput } from '../schema';
import { createTestimonial } from '../handlers/create_testimonial';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateTestimonialInput = {
  customer_name: 'John Doe',
  review: 'Amazing food and excellent service! Highly recommend this place.',
  rating: 5
};

// Test input with optional date field
const testInputWithDate: CreateTestimonialInput = {
  customer_name: 'Jane Smith',
  review: 'Good food but service could be improved.',
  rating: 3,
  date: new Date('2024-01-15T10:30:00Z')
};

describe('createTestimonial', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a testimonial without date (uses current date)', async () => {
    const result = await createTestimonial(testInput);

    // Basic field validation
    expect(result.customer_name).toEqual('John Doe');
    expect(result.review).toEqual('Amazing food and excellent service! Highly recommend this place.');
    expect(result.rating).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.date).toBeInstanceOf(Date);
    
    // Verify date was set to current date (within reasonable tolerance)
    const now = new Date();
    const timeDiff = Math.abs(result.date.getTime() - now.getTime());
    expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
  });

  it('should create a testimonial with provided date', async () => {
    const result = await createTestimonial(testInputWithDate);

    // Basic field validation
    expect(result.customer_name).toEqual('Jane Smith');
    expect(result.review).toEqual('Good food but service could be improved.');
    expect(result.rating).toEqual(3);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.date).toBeInstanceOf(Date);
    
    // Verify the provided date was used
    expect(result.date.toISOString()).toEqual('2024-01-15T10:30:00.000Z');
  });

  it('should save testimonial to database', async () => {
    const result = await createTestimonial(testInput);

    // Query using proper drizzle syntax
    const testimonials = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, result.id))
      .execute();

    expect(testimonials).toHaveLength(1);
    expect(testimonials[0].customer_name).toEqual('John Doe');
    expect(testimonials[0].review).toEqual('Amazing food and excellent service! Highly recommend this place.');
    expect(testimonials[0].rating).toEqual(5);
    expect(testimonials[0].created_at).toBeInstanceOf(Date);
    expect(testimonials[0].date).toBeInstanceOf(Date);
  });

  it('should handle different rating values correctly', async () => {
    // Test minimum rating
    const minRatingInput: CreateTestimonialInput = {
      customer_name: 'Bob Wilson',
      review: 'Not satisfied with the experience.',
      rating: 1
    };

    const minResult = await createTestimonial(minRatingInput);
    expect(minResult.rating).toEqual(1);

    // Test maximum rating
    const maxRatingInput: CreateTestimonialInput = {
      customer_name: 'Alice Brown',
      review: 'Perfect experience!',
      rating: 5
    };

    const maxResult = await createTestimonial(maxRatingInput);
    expect(maxResult.rating).toEqual(5);

    // Verify both were saved to database
    const allTestimonials = await db.select()
      .from(testimonialsTable)
      .execute();

    expect(allTestimonials).toHaveLength(2);
    expect(allTestimonials.some(t => t.rating === 1)).toBe(true);
    expect(allTestimonials.some(t => t.rating === 5)).toBe(true);
  });

  it('should handle long reviews correctly', async () => {
    const longReviewInput: CreateTestimonialInput = {
      customer_name: 'Charlie Davis',
      review: 'This is a very long review that describes in detail the amazing experience I had at this restaurant. The food was exceptional, the service was outstanding, and the atmosphere was perfect for a romantic dinner. I will definitely be coming back and recommending this place to all my friends and family.',
      rating: 4
    };

    const result = await createTestimonial(longReviewInput);

    expect(result.customer_name).toEqual('Charlie Davis');
    expect(result.review).toEqual(longReviewInput.review);
    expect(result.rating).toEqual(4);

    // Verify it was saved correctly in database
    const testimonial = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, result.id))
      .execute();

    expect(testimonial[0].review).toEqual(longReviewInput.review);
  });
});