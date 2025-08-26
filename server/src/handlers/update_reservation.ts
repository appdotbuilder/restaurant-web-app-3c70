import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type UpdateReservationStatusInput, type Reservation } from '../schema';
import { eq } from 'drizzle-orm';

export const updateReservationStatus = async (input: UpdateReservationStatusInput): Promise<Reservation | null> => {
  try {
    // Update the reservation status
    const result = await db.update(reservationsTable)
      .set({
        status: input.status
      })
      .where(eq(reservationsTable.id, input.id))
      .returning()
      .execute();

    // Return null if no reservation was found and updated
    if (result.length === 0) {
      return null;
    }

    // Return the updated reservation
    const reservation = result[0];
    return {
      id: reservation.id,
      customer_name: reservation.customer_name,
      customer_phone: reservation.customer_phone,
      number_of_people: reservation.number_of_people,
      date: reservation.date,
      time: reservation.time,
      status: reservation.status,
      created_at: reservation.created_at
    };
  } catch (error) {
    console.error('Reservation status update failed:', error);
    throw error;
  }
};