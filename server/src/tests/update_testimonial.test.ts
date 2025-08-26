import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type UpdateTestimonialInput } from '../schema';
import { updateTestimonial, deleteTestimonial } from '../handlers/update_testimonial';
import { eq } from 'drizzle-orm';

describe('updateTestimonial', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestTestimonial = async () => {
    const testDate = new Date('2024-01-15');
    const result = await db.insert(testimonialsTable)
      .values({
        customer_name: 'John Doe',
        review: 'Great restaurant!',
        rating: 5,
        date: testDate
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should update testimonial successfully', async () => {
    const testimonial = await createTestTestimonial();
    
    const updateInput: UpdateTestimonialInput = {
      id: testimonial.id,
      customer_name: 'Jane Smith',
      review: 'Amazing food and service!',
      rating: 4
    };

    const result = await updateTestimonial(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(testimonial.id);
    expect(result?.customer_name).toEqual('Jane Smith');
    expect(result?.review).toEqual('Amazing food and service!');
    expect(result?.rating).toEqual(4);
    expect(result?.date).toBeInstanceOf(Date);
    expect(result?.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const testimonial = await createTestTestimonial();
    
    const updateInput: UpdateTestimonialInput = {
      id: testimonial.id,
      rating: 3
    };

    const result = await updateTestimonial(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(testimonial.id);
    expect(result?.customer_name).toEqual('John Doe'); // Original value preserved
    expect(result?.review).toEqual('Great restaurant!'); // Original value preserved
    expect(result?.rating).toEqual(3); // Updated value
    expect(result?.date).toBeInstanceOf(Date);
  });

  it('should update testimonial date', async () => {
    const testimonial = await createTestTestimonial();
    const newDate = new Date('2024-02-20');
    
    const updateInput: UpdateTestimonialInput = {
      id: testimonial.id,
      date: newDate
    };

    const result = await updateTestimonial(updateInput);

    expect(result).toBeDefined();
    expect(result?.date).toEqual(newDate);
    expect(result?.customer_name).toEqual('John Doe'); // Other fields preserved
  });

  it('should save updated testimonial to database', async () => {
    const testimonial = await createTestTestimonial();
    
    const updateInput: UpdateTestimonialInput = {
      id: testimonial.id,
      customer_name: 'Updated Name',
      rating: 2
    };

    await updateTestimonial(updateInput);

    // Verify in database
    const dbTestimonials = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, testimonial.id))
      .execute();

    expect(dbTestimonials).toHaveLength(1);
    expect(dbTestimonials[0].customer_name).toEqual('Updated Name');
    expect(dbTestimonials[0].rating).toEqual(2);
    expect(dbTestimonials[0].review).toEqual('Great restaurant!'); // Unchanged
  });

  it('should return null for non-existent testimonial', async () => {
    const updateInput: UpdateTestimonialInput = {
      id: 99999,
      customer_name: 'Non-existent'
    };

    const result = await updateTestimonial(updateInput);

    expect(result).toBeNull();
  });

  it('should validate rating bounds', async () => {
    const testimonial = await createTestTestimonial();
    
    const updateInputHigh: UpdateTestimonialInput = {
      id: testimonial.id,
      rating: 5 // Valid max rating
    };

    const resultHigh = await updateTestimonial(updateInputHigh);
    expect(resultHigh?.rating).toEqual(5);

    const updateInputLow: UpdateTestimonialInput = {
      id: testimonial.id,
      rating: 1 // Valid min rating
    };

    const resultLow = await updateTestimonial(updateInputLow);
    expect(resultLow?.rating).toEqual(1);
  });
});

describe('deleteTestimonial', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestTestimonial = async () => {
    const testDate = new Date('2024-01-15');
    const result = await db.insert(testimonialsTable)
      .values({
        customer_name: 'John Doe',
        review: 'Great restaurant!',
        rating: 5,
        date: testDate
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should delete testimonial successfully', async () => {
    const testimonial = await createTestTestimonial();

    const result = await deleteTestimonial(testimonial.id);

    expect(result).toBe(true);
  });

  it('should remove testimonial from database', async () => {
    const testimonial = await createTestTestimonial();

    await deleteTestimonial(testimonial.id);

    // Verify testimonial is removed from database
    const dbTestimonials = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, testimonial.id))
      .execute();

    expect(dbTestimonials).toHaveLength(0);
  });

  it('should return false for non-existent testimonial', async () => {
    const result = await deleteTestimonial(99999);

    expect(result).toBe(false);
  });

  it('should delete correct testimonial when multiple exist', async () => {
    // Create multiple testimonials
    const testimonial1 = await createTestTestimonial();
    const testimonial2 = await db.insert(testimonialsTable)
      .values({
        customer_name: 'Jane Smith',
        review: 'Excellent service!',
        rating: 4,
        date: new Date('2024-02-01')
      })
      .returning()
      .execute();

    // Delete only the first testimonial
    const result = await deleteTestimonial(testimonial1.id);

    expect(result).toBe(true);

    // Verify first testimonial is deleted
    const dbTestimonial1 = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, testimonial1.id))
      .execute();

    expect(dbTestimonial1).toHaveLength(0);

    // Verify second testimonial still exists
    const dbTestimonial2 = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, testimonial2[0].id))
      .execute();

    expect(dbTestimonial2).toHaveLength(1);
    expect(dbTestimonial2[0].customer_name).toEqual('Jane Smith');
  });
});