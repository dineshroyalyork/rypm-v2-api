import { z } from 'zod';

export const addPropertySchema = z.object({
  property_ids: z.array(z.string().uuid('Invalid property_id')),
});

export type AddPropertyDto = z.infer<typeof addPropertySchema>;