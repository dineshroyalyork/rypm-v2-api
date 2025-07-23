import { z } from 'zod';

export const createTourSlotsSchema = z.object({
  property_id: z.string().min(1, 'Property ID is required'),
  tour_date: z.string().datetime('Invalid date format'),
  slot_duration_hours: z.number().min(1, 'At least 1 slot required').max(24, 'Maximum 24 slots per day'),
});

export type CreateTourSlotsDto = z.infer<typeof createTourSlotsSchema>;
