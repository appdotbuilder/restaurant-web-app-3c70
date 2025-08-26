import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type Reservation } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getReservations = async (): Promise<Reservation[]> => {
  try {
    const result = await db.select()
      .from(reservationsTable)
      .orderBy(asc(reservationsTable.date), asc(reservationsTable.time))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    throw error;
  }
};

export const getReservationsByStatus = async (status: Reservation['status']): Promise<Reservation[]> => {
  try {
    const result = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.status, status))
      .orderBy(asc(reservationsTable.date), asc(reservationsTable.time))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch reservations by status:', error);
    throw error;
  }
};

export const getReservationsByDate = async (date: string): Promise<Reservation[]> => {
  try {
    const result = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.date, date))
      .orderBy(asc(reservationsTable.time))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch reservations by date:', error);
    throw error;
  }
};

export const getReservationById = async (id: number): Promise<Reservation | null> => {
  try {
    const result = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, id))
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch reservation by id:', error);
    throw error;
  }
};