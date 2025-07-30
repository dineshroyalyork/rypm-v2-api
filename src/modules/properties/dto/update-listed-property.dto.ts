import { z } from 'zod';
import { listPropertySchema } from './list-property.dto';

export const updateListedPropertySchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  ...listPropertySchema.shape,
});

export type UpdateListedPropertyDto = z.infer<typeof updateListedPropertySchema>; 