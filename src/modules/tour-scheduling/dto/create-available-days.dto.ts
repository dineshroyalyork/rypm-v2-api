import { z } from 'zod';

export const createAvailableDaysSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  weekday: z.string({ message: 'Weekday is required' }), // "MONDAY", "TUESDAY", etc.
  open_time: z.string({ message: 'Open time is required' }), // "09:00" format
  close_time: z.string({ message: 'Close time is required' }), // "18:00" format
});

export type CreateAvailableDaysDto = z.infer<typeof createAvailableDaysSchema>;
