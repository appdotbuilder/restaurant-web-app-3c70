import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type CreateReservationInput } from '../schema';
import { createReservation } from '../handlers/create_reservation';
import { eq, and, gte } from 'drizzle-orm';

// Simple test input
const testInput: CreateReservationInput = {
  customer_name: 'John Doe',
  customer_phone: '+1234567890',
  number_of_people: 4,
  date: '2024-12-15',
  time: '19:00'
};

describe('createReservation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a reservation', async () => {
    const result = await createReservation(testInput);

    // Basic field validation
    expect(result.customer_name).toEqual('John Doe');
    expect(result.customer_phone).toEqual('+1234567890');
    expect(result.number_of_people).toEqual(4);
    expect(result.date).toEqual('2024-12-15');
    expect(result.time).toEqual('19:00');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save reservation to database', async () => {
    const result = await createReservation(testInput);

    // Query using proper drizzle syntax
    const reservations = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, result.id))
      .execute();

    expect(reservations).toHaveLength(1);
    expect(reservations[0].customer_name).toEqual('John Doe');
    expect(reservations[0].customer_phone).toEqual('+1234567890');
    expect(reservations[0].number_of_people).toEqual(4);
    expect(reservations[0].date).toEqual('2024-12-15');
    expect(reservations[0].time).toEqual('19:00');
    expect(reservations[0].status).toEqual('pending');
    expect(reservations[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different reservation sizes', async () => {
    const largePartyInput: CreateReservationInput = {
      customer_name: 'Jane Smith',
      customer_phone: '+9876543210',
      number_of_people: 12,
      date: '2024-12-20',
      time: '18:30'
    };

    const result = await createReservation(largePartyInput);

    expect(result.customer_name).toEqual('Jane Smith');
    expect(result.number_of_people).toEqual(12);
    expect(result.date).toEqual('2024-12-20');
    expect(result.time).toEqual('18:30');
    expect(result.status).toEqual('pending');
  });

  it('should handle different date and time formats', async () => {
    const differentTimeInput: CreateReservationInput = {
      customer_name: 'Bob Wilson',
      customer_phone: '+1122334455',
      number_of_people: 2,
      date: '2024-01-01',
      time: '12:00'
    };

    const result = await createReservation(differentTimeInput);

    expect(result.customer_name).toEqual('Bob Wilson');
    expect(result.date).toEqual('2024-01-01');
    expect(result.time).toEqual('12:00');
    expect(result.status).toEqual('pending');
  });

  it('should query reservations by date correctly', async () => {
    // Create multiple reservations with different dates
    const todayInput = {
      ...testInput,
      customer_name: 'Customer Today',
      date: '2024-12-15'
    };

    const futureInput = {
      ...testInput,
      customer_name: 'Customer Future',
      date: '2024-12-25'
    };

    await createReservation(todayInput);
    await createReservation(futureInput);

    // Query reservations for specific date
    const reservationsForDate = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.date, '2024-12-15'))
      .execute();

    expect(reservationsForDate).toHaveLength(1);
    expect(reservationsForDate[0].customer_name).toEqual('Customer Today');
    expect(reservationsForDate[0].date).toEqual('2024-12-15');
  });

  it('should query reservations by status correctly', async () => {
    // Create test reservation
    await createReservation(testInput);

    // Query reservations by status
    const pendingReservations = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.status, 'pending'))
      .execute();

    expect(pendingReservations.length).toBeGreaterThan(0);
    pendingReservations.forEach(reservation => {
      expect(reservation.status).toEqual('pending');
      expect(reservation.created_at).toBeInstanceOf(Date);
    });
  });

  it('should query reservations with multiple conditions', async () => {
    // Create reservations with different combinations
    const reservation1 = {
      ...testInput,
      customer_name: 'Alice',
      date: '2024-12-15',
      number_of_people: 4
    };

    const reservation2 = {
      ...testInput,
      customer_name: 'Bob',
      date: '2024-12-15',
      number_of_people: 2
    };

    const reservation3 = {
      ...testInput,
      customer_name: 'Charlie',
      date: '2024-12-16',
      number_of_people: 4
    };

    await createReservation(reservation1);
    await createReservation(reservation2);
    await createReservation(reservation3);

    // Query with multiple conditions
    const filteredReservations = await db.select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.date, '2024-12-15'),
          gte(reservationsTable.number_of_people, 4)
        )
      )
      .execute();

    expect(filteredReservations).toHaveLength(1);
    expect(filteredReservations[0].customer_name).toEqual('Alice');
    expect(filteredReservations[0].date).toEqual('2024-12-15');
    expect(filteredReservations[0].number_of_people).toEqual(4);
  });

  it('should handle phone numbers with different formats', async () => {
    const phoneVariations = [
      '+1234567890',
      '(555) 123-4567',
      '555-123-4567',
      '5551234567'
    ];

    for (let i = 0; i < phoneVariations.length; i++) {
      const input = {
        ...testInput,
        customer_name: `Customer ${i + 1}`,
        customer_phone: phoneVariations[i]
      };

      const result = await createReservation(input);
      expect(result.customer_phone).toEqual(phoneVariations[i]);
    }

    // Verify all reservations were created
    const allReservations = await db.select()
      .from(reservationsTable)
      .execute();

    expect(allReservations).toHaveLength(phoneVariations.length);
  });
});