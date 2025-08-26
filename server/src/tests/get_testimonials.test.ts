import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { getTestimonials, getTestimonialsByRating, getTestimonialById } from '../handlers/get_testimonials';

describe('getTestimonials handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create test testimonials
  const createTestTestimonial = async (overrides: Partial<any> = {}) => {
    const defaultTestimonial = {
      customer_name: 'John Doe',
      review: 'Great food and service!',
      rating: 5,
      date: new Date('2024-01-15'),
      ...overrides
    };

    const results = await db.insert(testimonialsTable)
      .values(defaultTestimonial)
      .returning()
      .execute();

    return results[0];
  };

  describe('getTestimonials', () => {
    it('should return empty array when no testimonials exist', async () => {
      const result = await getTestimonials();
      expect(result).toEqual([]);
    });

    it('should return all testimonials ordered by date (newest first)', async () => {
      // Create testimonials with different dates
      const older = await createTestTestimonial({
        customer_name: 'Alice',
        date: new Date('2024-01-10'),
        rating: 4
      });

      const newer = await createTestTestimonial({
        customer_name: 'Bob',
        date: new Date('2024-01-20'),
        rating: 5
      });

      const result = await getTestimonials();

      expect(result).toHaveLength(2);
      
      // Should be ordered by date desc (newest first)
      expect(result[0].customer_name).toEqual('Bob');
      expect(result[1].customer_name).toEqual('Alice');
      
      // Verify all fields are present and correctly typed
      expect(result[0].id).toBeDefined();
      expect(result[0].customer_name).toEqual('Bob');
      expect(result[0].review).toEqual('Great food and service!');
      expect(result[0].rating).toEqual(5);
      expect(result[0].date).toBeInstanceOf(Date);
      expect(result[0].created_at).toBeInstanceOf(Date);
    });

    it('should convert date field to Date object', async () => {
      await createTestTestimonial({
        date: new Date('2024-01-15')
      });

      const result = await getTestimonials();

      expect(result).toHaveLength(1);
      expect(result[0].date).toBeInstanceOf(Date);
      expect(result[0].date.toISOString()).toMatch(/2024-01-15/);
    });
  });

  describe('getTestimonialsByRating', () => {
    it('should return empty array when no testimonials meet rating criteria', async () => {
      await createTestTestimonial({ rating: 3 });
      
      const result = await getTestimonialsByRating(4);
      expect(result).toEqual([]);
    });

    it('should return testimonials with rating >= minRating', async () => {
      // Create testimonials with different ratings
      await createTestTestimonial({
        customer_name: 'Low Rating',
        rating: 2
      });

      await createTestTestimonial({
        customer_name: 'Medium Rating',
        rating: 4
      });

      await createTestTestimonial({
        customer_name: 'High Rating',
        rating: 5
      });

      const result = await getTestimonialsByRating(4);

      expect(result).toHaveLength(2);
      expect(result.every(t => t.rating >= 4)).toBe(true);
      
      // Should include both rating 4 and 5
      const customerNames = result.map(t => t.customer_name);
      expect(customerNames).toContain('Medium Rating');
      expect(customerNames).toContain('High Rating');
      expect(customerNames).not.toContain('Low Rating');
    });

    it('should return testimonials ordered by date (newest first)', async () => {
      // Create testimonials with same rating but different dates
      await createTestTestimonial({
        customer_name: 'Older',
        rating: 4,
        date: new Date('2024-01-10')
      });

      await createTestTestimonial({
        customer_name: 'Newer',
        rating: 4,
        date: new Date('2024-01-20')
      });

      const result = await getTestimonialsByRating(4);

      expect(result).toHaveLength(2);
      expect(result[0].customer_name).toEqual('Newer');
      expect(result[1].customer_name).toEqual('Older');
    });

    it('should include testimonials with exact matching rating', async () => {
      await createTestTestimonial({
        customer_name: 'Exact Match',
        rating: 4
      });

      const result = await getTestimonialsByRating(4);

      expect(result).toHaveLength(1);
      expect(result[0].rating).toEqual(4);
      expect(result[0].customer_name).toEqual('Exact Match');
    });

    it('should convert date field to Date object', async () => {
      await createTestTestimonial({
        rating: 5,
        date: new Date('2024-01-15')
      });

      const result = await getTestimonialsByRating(4);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBeInstanceOf(Date);
    });
  });

  describe('getTestimonialById', () => {
    it('should return null when testimonial does not exist', async () => {
      const result = await getTestimonialById(999);
      expect(result).toBeNull();
    });

    it('should return testimonial when it exists', async () => {
      const created = await createTestTestimonial({
        customer_name: 'Test Customer',
        review: 'Amazing experience!',
        rating: 5,
        date: new Date('2024-01-15')
      });

      const result = await getTestimonialById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.customer_name).toEqual('Test Customer');
      expect(result!.review).toEqual('Amazing experience!');
      expect(result!.rating).toEqual(5);
      expect(result!.date).toBeInstanceOf(Date);
      expect(result!.created_at).toBeInstanceOf(Date);
    });

    it('should convert date field to Date object', async () => {
      const created = await createTestTestimonial({
        date: new Date('2024-01-15')
      });

      const result = await getTestimonialById(created.id);

      expect(result).not.toBeNull();
      expect(result!.date).toBeInstanceOf(Date);
      expect(result!.date.toISOString()).toMatch(/2024-01-15/);
    });

    it('should return correct testimonial when multiple exist', async () => {
      const first = await createTestTestimonial({
        customer_name: 'First Customer'
      });

      const second = await createTestTestimonial({
        customer_name: 'Second Customer'
      });

      // Test getting the first one
      const result1 = await getTestimonialById(first.id);
      expect(result1).not.toBeNull();
      expect(result1!.customer_name).toEqual('First Customer');

      // Test getting the second one
      const result2 = await getTestimonialById(second.id);
      expect(result2).not.toBeNull();
      expect(result2!.customer_name).toEqual('Second Customer');
    });
  });
});