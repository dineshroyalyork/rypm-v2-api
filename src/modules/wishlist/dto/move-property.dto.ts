// move-property.dto.ts
import { z } from 'zod';

export const movePropertySchema = z.object({
  from_wishlist_id: z.string().uuid({ message: 'Invalid from_wishlist_id UUID' }),
  to_wishlist_id: z.string().uuid({ message: 'Invalid to_wishlist_id UUID' }),
  property_ids: z.array(z.string().uuid({ message: 'Invalid property_id UUID' })),
});

export type MovePropertyDto = z.infer<typeof movePropertySchema>;
