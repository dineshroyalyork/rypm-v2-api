import { z } from 'zod';

export const updateTourScheduledSchema = z.object({
  id: z.string().uuid('Invalid tour ID'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  move_in_date: z.string().datetime().optional(),
});

export type UpdateTourScheduledDto = z.infer<typeof updateTourScheduledSchema>; 