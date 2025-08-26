import { z } from 'zod';

// Menu Item schemas
export const menuItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.enum(['food', 'drinks', 'packages']),
  price: z.number().positive(),
  image_url: z.string().nullable(),
  created_at: z.coerce.date()
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// Input schema for creating menu items
export const createMenuItemInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  category: z.enum(['food', 'drinks', 'packages']),
  price: z.number().positive('Price must be positive'),
  image_url: z.string().nullable()
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemInputSchema>;

// Input schema for updating menu items
export const updateMenuItemInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().nullable().optional(),
  category: z.enum(['food', 'drinks', 'packages']).optional(),
  price: z.number().positive('Price must be positive').optional(),
  image_url: z.string().nullable().optional()
});

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemInputSchema>;

// Order Item schema for JSON storage
export const orderItemSchema = z.object({
  menu_item_id: z.number(),
  quantity: z.number().int().positive()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Order schemas
export const orderSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  customer_phone: z.string(),
  items: z.array(orderItemSchema),
  total_amount: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  created_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Input schema for creating orders
export const createOrderInputSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().min(1, 'Customer phone is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  total_amount: z.number().positive('Total amount must be positive')
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

// Input schema for updating order status
export const updateOrderStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInputSchema>;

// Reservation schemas
export const reservationSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  customer_phone: z.string(),
  number_of_people: z.number().int().positive(),
  date: z.string(), // Store as string in YYYY-MM-DD format
  time: z.string(), // Store as string in HH:MM format
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  created_at: z.coerce.date()
});

export type Reservation = z.infer<typeof reservationSchema>;

// Input schema for creating reservations
export const createReservationInputSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().min(1, 'Customer phone is required'),
  number_of_people: z.number().int().positive('Number of people must be positive'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required')
});

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

// Input schema for updating reservation status
export const updateReservationStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'confirmed', 'cancelled'])
});

export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusInputSchema>;

// Testimonial schemas
export const testimonialSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  review: z.string(),
  rating: z.number().int().min(1).max(5),
  date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// Input schema for creating testimonials
export const createTestimonialInputSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  review: z.string().min(1, 'Review is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  date: z.coerce.date().optional() // Optional, defaults to current date
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialInputSchema>;

// Input schema for updating testimonials
export const updateTestimonialInputSchema = z.object({
  id: z.number(),
  customer_name: z.string().min(1, 'Customer name is required').optional(),
  review: z.string().min(1, 'Review is required').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  date: z.coerce.date().optional()
});

export type UpdateTestimonialInput = z.infer<typeof updateTestimonialInputSchema>;