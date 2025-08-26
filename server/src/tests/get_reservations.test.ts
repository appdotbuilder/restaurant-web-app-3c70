import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { 
  getReservations, 
  getReservationsByStatus, 
  getReservationsByDate, 
  getReservationById 
} from '../handlers/get_reservations';

// Test data
const testReservations = [
  {
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    number_of_people: 4,
    date: '2024-01-15',
    time: '18:00',
    status: 'confirmed' as const
  },
  {
    customer_name: 'Jane Smith',
    customer_phone: '+1234567891',
    number_of_people: 2,
    date: '2024-01-15',
    time: '19:30',
    status: 'pending' as const
  },
  {
    customer_name: 'Bob Johnson',
    customer_phone: '+1234567892',
    number_of_people: 6,
    date: '2024-01-16',
    time: '17:00',
    status: 'confirmed' as const
  },
  {
    customer_name: 'Alice Brown',
    customer_phone: '+1234567893',
    number_of_people: 3,
    date: '2024-01-16',
    time: '20:00',
    status: 'cancelled' as const
  }
];

describe('getReservations handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('getReservations', () => {
    it('should return empty array when no reservations exist', async () => {
      const result = await getReservations();
      expect(result).toEqual([]);
    });

    it('should return all reservations ordered by date and time', async () => {
      // Insert test data
      await db.insert(reservationsTable).values(testReservations).execute();

      const result = await getReservations();

      expect(result).toHaveLength(4);
      expect(result[0].customer_name).toEqual('John Doe');
      expect(result[0].date).toEqual('2024-01-15');
      expect(result[0].time).toEqual('18:00');
      expect(result[0].status).toEqual('confirmed');
      expect(result[0].number_of_people).toEqual(4);
      expect(result[0].id).toBeDefined();
      expect(result[0].created_at).toBeInstanceOf(Date);

      // Verify ordering by date then time
      expect(result[0].date).toEqual('2024-01-15'); // First date
      expect(result[0].time).toEqual('18:00'); // Earlier time
      expect(result[1].date).toEqual('2024-01-15'); // Same date
      expect(result[1].time).toEqual('19:30'); // Later time
      expect(result[2].date).toEqual('2024-01-16'); // Second date
      expect(result[2].time).toEqual('17:00'); // Earlier time
      expect(result[3].date).toEqual('2024-01-16'); // Same date
      expect(result[3].time).toEqual('20:00'); // Later time
    });

    it('should include all reservation fields', async () => {
      await db.insert(reservationsTable).values([testReservations[0]]).execute();

      const result = await getReservations();

      expect(result).toHaveLength(1);
      const reservation = result[0];
      expect(reservation.id).toBeDefined();
      expect(reservation.customer_name).toEqual('John Doe');
      expect(reservation.customer_phone).toEqual('+1234567890');
      expect(reservation.number_of_people).toEqual(4);
      expect(reservation.date).toEqual('2024-01-15');
      expect(reservation.time).toEqual('18:00');
      expect(reservation.status).toEqual('confirmed');
      expect(reservation.created_at).toBeInstanceOf(Date);
    });
  });

  describe('getReservationsByStatus', () => {
    beforeEach(async () => {
      // Insert test data for status filtering tests
      await db.insert(reservationsTable).values(testReservations).execute();
    });

    it('should return only confirmed reservations', async () => {
      const result = await getReservationsByStatus('confirmed');

      expect(result).toHaveLength(2);
      expect(result[0].customer_name).toEqual('John Doe');
      expect(result[0].status).toEqual('confirmed');
      expect(result[1].customer_name).toEqual('Bob Johnson');
      expect(result[1].status).toEqual('confirmed');

      // Verify ordering by date and time
      expect(result[0].date).toEqual('2024-01-15');
      expect(result[1].date).toEqual('2024-01-16');
    });

    it('should return only pending reservations', async () => {
      const result = await getReservationsByStatus('pending');

      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toEqual('Jane Smith');
      expect(result[0].status).toEqual('pending');
    });

    it('should return only cancelled reservations', async () => {
      const result = await getReservationsByStatus('cancelled');

      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toEqual('Alice Brown');
      expect(result[0].status).toEqual('cancelled');
    });

    it('should return empty array for status with no reservations', async () => {
      // Clear data and insert only confirmed reservations
      await db.delete(reservationsTable).execute();
      await db.insert(reservationsTable).values([testReservations[0]]).execute();

      const result = await getReservationsByStatus('pending');
      expect(result).toEqual([]);
    });
  });

  describe('getReservationsByDate', () => {
    beforeEach(async () => {
      // Insert test data for date filtering tests
      await db.insert(reservationsTable).values(testReservations).execute();
    });

    it('should return reservations for specific date ordered by time', async () => {
      const result = await getReservationsByDate('2024-01-15');

      expect(result).toHaveLength(2);
      expect(result[0].customer_name).toEqual('John Doe');
      expect(result[0].time).toEqual('18:00');
      expect(result[1].customer_name).toEqual('Jane Smith');
      expect(result[1].time).toEqual('19:30');

      // Verify all have the same date
      result.forEach(reservation => {
        expect(reservation.date).toEqual('2024-01-15');
      });
    });

    it('should return reservations for different date', async () => {
      const result = await getReservationsByDate('2024-01-16');

      expect(result).toHaveLength(2);
      expect(result[0].customer_name).toEqual('Bob Johnson');
      expect(result[0].time).toEqual('17:00');
      expect(result[1].customer_name).toEqual('Alice Brown');
      expect(result[1].time).toEqual('20:00');

      // Verify all have the correct date
      result.forEach(reservation => {
        expect(reservation.date).toEqual('2024-01-16');
      });
    });

    it('should return empty array for date with no reservations', async () => {
      const result = await getReservationsByDate('2024-01-20');
      expect(result).toEqual([]);
    });

    it('should handle date format correctly', async () => {
      const result = await getReservationsByDate('2024-01-15');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].date).toEqual('2024-01-15');
    });
  });

  describe('getReservationById', () => {
    let insertedIds: number[];

    beforeEach(async () => {
      // Insert test data and capture IDs
      const insertResults = await db.insert(reservationsTable)
        .values(testReservations)
        .returning({ id: reservationsTable.id })
        .execute();
      
      insertedIds = insertResults.map(r => r.id);
    });

    it('should return reservation by valid ID', async () => {
      const targetId = insertedIds[0];
      const result = await getReservationById(targetId);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(targetId);
      expect(result!.customer_name).toEqual('John Doe');
      expect(result!.customer_phone).toEqual('+1234567890');
      expect(result!.number_of_people).toEqual(4);
      expect(result!.date).toEqual('2024-01-15');
      expect(result!.time).toEqual('18:00');
      expect(result!.status).toEqual('confirmed');
      expect(result!.created_at).toBeInstanceOf(Date);
    });

    it('should return correct reservation for different ID', async () => {
      const targetId = insertedIds[2]; // Bob Johnson
      const result = await getReservationById(targetId);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(targetId);
      expect(result!.customer_name).toEqual('Bob Johnson');
      expect(result!.date).toEqual('2024-01-16');
      expect(result!.status).toEqual('confirmed');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = 99999;
      const result = await getReservationById(nonExistentId);

      expect(result).toBeNull();
    });

    it('should return null for negative ID', async () => {
      const result = await getReservationById(-1);
      expect(result).toBeNull();
    });

    it('should return null when no reservations exist', async () => {
      // Clear all data
      await db.delete(reservationsTable).execute();
      
      const result = await getReservationById(1);
      expect(result).toBeNull();
    });
  });

  describe('edge cases and data integrity', () => {
    it('should handle reservations with different statuses correctly', async () => {
      const mixedStatusReservations = [
        { ...testReservations[0], status: 'pending' as const },
        { ...testReservations[1], status: 'confirmed' as const },
        { ...testReservations[2], status: 'cancelled' as const }
      ];

      await db.insert(reservationsTable).values(mixedStatusReservations).execute();

      const allReservations = await getReservations();
      const pendingReservations = await getReservationsByStatus('pending');
      const confirmedReservations = await getReservationsByStatus('confirmed');
      const cancelledReservations = await getReservationsByStatus('cancelled');

      expect(allReservations).toHaveLength(3);
      expect(pendingReservations).toHaveLength(1);
      expect(confirmedReservations).toHaveLength(1);
      expect(cancelledReservations).toHaveLength(1);
    });

    it('should handle multiple reservations for same customer', async () => {
      const sameCustomerReservations = [
        {
          customer_name: 'John Doe',
          customer_phone: '+1234567890',
          number_of_people: 2,
          date: '2024-01-15',
          time: '18:00',
          status: 'confirmed' as const
        },
        {
          customer_name: 'John Doe',
          customer_phone: '+1234567890',
          number_of_people: 4,
          date: '2024-01-16',
          time: '19:00',
          status: 'pending' as const
        }
      ];

      await db.insert(reservationsTable).values(sameCustomerReservations).execute();

      const result = await getReservations();
      expect(result).toHaveLength(2);
      expect(result[0].customer_name).toEqual('John Doe');
      expect(result[1].customer_name).toEqual('John Doe');
      expect(result[0].id).not.toEqual(result[1].id);
    });

    it('should preserve time format correctly', async () => {
      const timeFormatReservation = {
        customer_name: 'Time Test',
        customer_phone: '+1234567894',
        number_of_people: 2,
        date: '2024-01-15',
        time: '09:30', // Test morning time with leading zero
        status: 'confirmed' as const
      };

      await db.insert(reservationsTable).values([timeFormatReservation]).execute();

      const result = await getReservations();
      expect(result).toHaveLength(1);
      expect(result[0].time).toEqual('09:30');
    });
  });
});