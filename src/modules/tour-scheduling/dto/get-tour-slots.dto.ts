import { z } from 'zod';

export const getTourSlotsSchema = z.object({
  property_id: z.string().optional(),
  tour_date: z.string().datetime('Invalid date format').optional(),
  start_date: z.string().datetime('Invalid start date format').optional(),
  end_date: z.string().datetime('Invalid end date format').optional(),
});

export type GetTourSlotsDto = z.infer<typeof getTourSlotsSchema>;
