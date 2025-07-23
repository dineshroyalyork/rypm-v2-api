import { z } from 'zod';

export const RentalPreferencesSchema = z.object({
  price_min: z.number().min(0),
  price_max: z.number().min(0),
  bedrooms: z.string(),         // e.g., 'Studio+', '1+', etc.
  bathrooms: z.string(),        // e.g., 'All', '1+', etc.
  parking: z.string(),          // e.g., 'All', '1+', etc.
  property_type: z.string().optional(),
  move_in_date: z.string().optional(), // ISO date or dd/mm/yyyy
});

export type RentalPreferencesDto = z.infer<typeof RentalPreferencesSchema>;
