import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type CreateReservationInput, type Reservation } from '../schema';

export const createReservation = async (input: CreateReservationInput): Promise<Reservation> => {
  try {
    // Insert reservation record
    const result = await db.insert(reservationsTable)
      .values({
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        number_of_people: input.number_of_people,
        date: input.date,
        time: input.time,
        status: 'pending' // Default status from schema
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Reservation creation failed:', error);
    throw error;
  }
};