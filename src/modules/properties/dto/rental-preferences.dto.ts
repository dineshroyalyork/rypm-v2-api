import { z } from 'zod';

export const rentalPreferencesSchema = z.object({
  price_min: z.number().min(0, 'Price minimum must be 0 or greater'),
  price_max: z.number().min(0, 'Price maximum must be 0 or greater'),
  bedrooms: z.string().min(1, 'Bedrooms preference is required'), // e.g., 'Studio+', '1+', etc.
  bathrooms: z.string().min(1, 'Bathrooms preference is required'), // e.g., 'All', '1+', etc.
  parking: z.string().min(1, 'Parking preference is required'), // e.g., 'All', '1+', etc.
  property_type: z.string().optional(),
  move_in_date: z.string().optional(), // ISO date string or dd/mm/yyyy
});

export type RentalPreferencesDto = z.infer<typeof rentalPreferencesSchema>;
