import { z } from 'zod';

export const getTourSlotsSchema = z.object({
  property_id: z.string().min(1, 'Property ID is required'),
  days: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1, 'Days must be at least 1').max(30, 'Days cannot exceed 30'))
    .optional()
    .default(4),
});

export type GetTourSlotsDto = z.infer<typeof getTourSlotsSchema>;
