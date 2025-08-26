import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type UpdateReservationStatusInput, type CreateReservationInput } from '../schema';
import { updateReservationStatus } from '../handlers/update_reservation';
import { eq } from 'drizzle-orm';

// Helper to create a test reservation
const createTestReservation = async (input: CreateReservationInput) => {
  const result = await db.insert(reservationsTable)
    .values({
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      number_of_people: input.number_of_people,
      date: input.date,
      time: input.time,
      status: 'pending' // Default status
    })
    .returning()
    .execute();
  
  return result[0];
};

// Test reservation data
const testReservationInput: CreateReservationInput = {
  customer_name: 'John Doe',
  customer_phone: '555-0123',
  number_of_people: 4,
  date: '2024-03-15',
  time: '19:30'
};

describe('updateReservationStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update reservation status successfully', async () => {
    // Create a test reservation
    const reservation = await createTestReservation(testReservationInput);

    // Update the status
    const updateInput: UpdateReservationStatusInput = {
      id: reservation.id,
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(reservation.id);
    expect(result!.status).toEqual('confirmed');
    expect(result!.customer_name).toEqual('John Doe');
    expect(result!.customer_phone).toEqual('555-0123');
    expect(result!.number_of_people).toEqual(4);
    expect(result!.date).toEqual('2024-03-15');
    expect(result!.time).toEqual('19:30');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update reservation status in database', async () => {
    // Create a test reservation
    const reservation = await createTestReservation(testReservationInput);

    // Update the status
    const updateInput: UpdateReservationStatusInput = {
      id: reservation.id,
      status: 'cancelled'
    };

    await updateReservationStatus(updateInput);

    // Verify the status was updated in database
    const updatedReservations = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, reservation.id))
      .execute();

    expect(updatedReservations).toHaveLength(1);
    expect(updatedReservations[0].status).toEqual('cancelled');
    expect(updatedReservations[0].customer_name).toEqual('John Doe');
  });

  it('should return null for non-existent reservation', async () => {
    const updateInput: UpdateReservationStatusInput = {
      id: 99999, // Non-existent ID
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    expect(result).toBeNull();
  });

  it('should update to different status values correctly', async () => {
    // Create a test reservation
    const reservation = await createTestReservation(testReservationInput);

    // Test updating to each possible status
    const statusUpdates = [
      'confirmed' as const,
      'cancelled' as const,
      'pending' as const
    ];

    for (const status of statusUpdates) {
      const updateInput: UpdateReservationStatusInput = {
        id: reservation.id,
        status
      };

      const result = await updateReservationStatus(updateInput);

      expect(result).not.toBeNull();
      expect(result!.status).toEqual(status);
      expect(result!.id).toEqual(reservation.id);
      
      // Verify in database
      const dbReservation = await db.select()
        .from(reservationsTable)
        .where(eq(reservationsTable.id, reservation.id))
        .execute();

      expect(dbReservation[0].status).toEqual(status);
    }
  });

  it('should preserve all other reservation fields', async () => {
    // Create a test reservation
    const reservation = await createTestReservation(testReservationInput);

    // Update status
    const updateInput: UpdateReservationStatusInput = {
      id: reservation.id,
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    // Verify all original fields are preserved
    expect(result).not.toBeNull();
    expect(result!.customer_name).toEqual(reservation.customer_name);
    expect(result!.customer_phone).toEqual(reservation.customer_phone);
    expect(result!.number_of_people).toEqual(reservation.number_of_people);
    expect(result!.date).toEqual(reservation.date);
    expect(result!.time).toEqual(reservation.time);
    expect(result!.created_at).toEqual(reservation.created_at);
    
    // Only status should change
    expect(result!.status).toEqual('confirmed');
    expect(result!.status).not.toEqual(reservation.status);
  });

  it('should handle multiple reservations correctly', async () => {
    // Create multiple test reservations
    const reservation1 = await createTestReservation({
      ...testReservationInput,
      customer_name: 'Alice Smith'
    });

    const reservation2 = await createTestReservation({
      ...testReservationInput,
      customer_name: 'Bob Johnson'
    });

    // Update only the first reservation
    const updateInput: UpdateReservationStatusInput = {
      id: reservation1.id,
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    // Verify correct reservation was updated
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(reservation1.id);
    expect(result!.status).toEqual('confirmed');
    expect(result!.customer_name).toEqual('Alice Smith');

    // Verify second reservation was not affected
    const unchangedReservation = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, reservation2.id))
      .execute();

    expect(unchangedReservation[0].status).toEqual('pending');
    expect(unchangedReservation[0].customer_name).toEqual('Bob Johnson');
  });
});