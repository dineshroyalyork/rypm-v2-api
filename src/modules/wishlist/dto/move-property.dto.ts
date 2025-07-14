// move-property.dto.ts
import { z } from 'zod';

export const movePropertySchema = z.object({
  fromWishlistId: z.string().uuid({ message: 'Invalid fromWishlistId UUID' }),
  toWishlistId: z.string().uuid({ message: 'Invalid toWishlistId UUID' }),
  propertyId: z.string().uuid({ message: 'Invalid propertyId UUID' }),
});

export type MovePropertyDto = z.infer<typeof movePropertySchema>;
