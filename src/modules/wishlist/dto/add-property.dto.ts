// src/modules/wishlist/dto/add-property.dto.ts
import { z } from 'zod';

export const addPropertySchema = z.object({
  propertyId: z.string().uuid('Invalid propertyId'),
});

export type AddPropertyDto = z.infer<typeof addPropertySchema>;
