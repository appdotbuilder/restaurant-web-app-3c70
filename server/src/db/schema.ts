import { serial, text, pgTable, timestamp, numeric, integer, pgEnum, jsonb, date } from 'drizzle-orm/pg-core';

// Define enums for database
export const categoryEnum = pgEnum('category', ['food', 'drinks', 'packages']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);
export const reservationStatusEnum = pgEnum('reservation_status', ['pending', 'confirmed', 'cancelled']);

// Menu Items table
export const menuItemsTable = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  category: categoryEnum('category').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Orders table
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_phone: text('customer_phone').notNull(),
  items: jsonb('items').notNull(), // JSON array of {menu_item_id, quantity}
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Reservations table
export const reservationsTable = pgTable('reservations', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_phone: text('customer_phone').notNull(),
  number_of_people: integer('number_of_people').notNull(),
  date: text('date').notNull(), // Store as string in YYYY-MM-DD format
  time: text('time').notNull(), // Store as string in HH:MM format
  status: reservationStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Testimonials table
export const testimonialsTable = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  review: text('review').notNull(),
  rating: integer('rating').notNull(),
  date: timestamp('date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type MenuItem = typeof menuItemsTable.$inferSelect;
export type NewMenuItem = typeof menuItemsTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;

export type Reservation = typeof reservationsTable.$inferSelect;
export type NewReservation = typeof reservationsTable.$inferInsert;

export type Testimonial = typeof testimonialsTable.$inferSelect;
export type NewTestimonial = typeof testimonialsTable.$inferInsert;

// Export all tables for proper relation queries
export const tables = {
  menuItems: menuItemsTable,
  orders: ordersTable,
  reservations: reservationsTable,
  testimonials: testimonialsTable
};