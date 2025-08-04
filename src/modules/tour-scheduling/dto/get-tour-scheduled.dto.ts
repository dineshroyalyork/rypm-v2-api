import { z } from 'zod';

export const getTourScheduledSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
});

export type GetTourScheduledDto = z.infer<typeof getTourScheduledSchema>;
