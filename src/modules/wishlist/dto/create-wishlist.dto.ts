// src/modules/wishlist/dto/create-wishlist.dto.ts
import { z } from 'zod';

export const createWishlistSchema = z.object({
  name: z.string().min(1, 'Wishlist name is required'),
});

export type CreateWishlistDto = z.infer<typeof createWishlistSchema>;
