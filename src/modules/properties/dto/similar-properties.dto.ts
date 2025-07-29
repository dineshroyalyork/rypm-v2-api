import { z } from 'zod';

export const similarPropertiesSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
  radius_km: z.string().regex(/^\d+(\.\d+)?$/).optional().default('5'),
});

export type SimilarPropertiesDto = z.infer<typeof similarPropertiesSchema>; 