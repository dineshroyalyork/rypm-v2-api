import { z } from 'zod';

export const addLikedSchema = z.object({
  property_id: z.string().uuid('Invalid property_id'),
});

export type AddLikedDto = z.infer<typeof addLikedSchema>;
