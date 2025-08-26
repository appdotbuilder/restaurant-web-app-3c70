import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schema types
import { 
  createMenuItemInputSchema,
  updateMenuItemInputSchema,
  createOrderInputSchema,
  updateOrderStatusInputSchema,
  createReservationInputSchema,
  updateReservationStatusInputSchema,
  createTestimonialInputSchema,
  updateTestimonialInputSchema
} from './schema';

// Import handlers
import { createMenuItem } from './handlers/create_menu_item';
import { getMenuItems, getMenuItemsByCategory, getMenuItemById } from './handlers/get_menu_items';
import { updateMenuItem, deleteMenuItem } from './handlers/update_menu_item';
import { createOrder } from './handlers/create_order';
import { getOrders, getOrdersByStatus, getOrderById } from './handlers/get_orders';
import { updateOrderStatus } from './handlers/update_order';
import { createReservation } from './handlers/create_reservation';
import { getReservations, getReservationsByStatus, getReservationsByDate, getReservationById } from './handlers/get_reservations';
import { updateReservationStatus } from './handlers/update_reservation';
import { createTestimonial } from './handlers/create_testimonial';
import { getTestimonials, getTestimonialsByRating, getTestimonialById } from './handlers/get_testimonials';
import { updateTestimonial, deleteTestimonial } from './handlers/update_testimonial';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Menu Item routes
  createMenuItem: publicProcedure
    .input(createMenuItemInputSchema)
    .mutation(({ input }) => createMenuItem(input)),
  
  getMenuItems: publicProcedure
    .query(() => getMenuItems()),
  
  getMenuItemsByCategory: publicProcedure
    .input(z.enum(['food', 'drinks', 'packages']))
    .query(({ input }) => getMenuItemsByCategory(input)),
  
  getMenuItemById: publicProcedure
    .input(z.number())
    .query(({ input }) => getMenuItemById(input)),
  
  updateMenuItem: publicProcedure
    .input(updateMenuItemInputSchema)
    .mutation(({ input }) => updateMenuItem(input)),
  
  deleteMenuItem: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteMenuItem(input)),

  // Order routes
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }) => createOrder(input)),
  
  getOrders: publicProcedure
    .query(() => getOrders()),
  
  getOrdersByStatus: publicProcedure
    .input(z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']))
    .query(({ input }) => getOrdersByStatus(input)),
  
  getOrderById: publicProcedure
    .input(z.number())
    .query(({ input }) => getOrderById(input)),
  
  updateOrderStatus: publicProcedure
    .input(updateOrderStatusInputSchema)
    .mutation(({ input }) => updateOrderStatus(input)),

  // Reservation routes
  createReservation: publicProcedure
    .input(createReservationInputSchema)
    .mutation(({ input }) => createReservation(input)),
  
  getReservations: publicProcedure
    .query(() => getReservations()),
  
  getReservationsByStatus: publicProcedure
    .input(z.enum(['pending', 'confirmed', 'cancelled']))
    .query(({ input }) => getReservationsByStatus(input)),
  
  getReservationsByDate: publicProcedure
    .input(z.string())
    .query(({ input }) => getReservationsByDate(input)),
  
  getReservationById: publicProcedure
    .input(z.number())
    .query(({ input }) => getReservationById(input)),
  
  updateReservationStatus: publicProcedure
    .input(updateReservationStatusInputSchema)
    .mutation(({ input }) => updateReservationStatus(input)),

  // Testimonial routes
  createTestimonial: publicProcedure
    .input(createTestimonialInputSchema)
    .mutation(({ input }) => createTestimonial(input)),
  
  getTestimonials: publicProcedure
    .query(() => getTestimonials()),
  
  getTestimonialsByRating: publicProcedure
    .input(z.number().min(1).max(5))
    .query(({ input }) => getTestimonialsByRating(input)),
  
  getTestimonialById: publicProcedure
    .input(z.number())
    .query(({ input }) => getTestimonialById(input)),
  
  updateTestimonial: publicProcedure
    .input(updateTestimonialInputSchema)
    .mutation(({ input }) => updateTestimonial(input)),
  
  deleteTestimonial: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteTestimonial(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();