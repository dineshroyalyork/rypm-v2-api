import { z } from 'zod';

export const updateWishlistNameSchema = z.object({
  name: z.string().min(1, 'Wishlist name is required').max(100, 'Wishlist name cannot exceed 100 characters'),
});

export type UpdateWishlistNameDto = z.infer<typeof updateWishlistNameSchema>; 