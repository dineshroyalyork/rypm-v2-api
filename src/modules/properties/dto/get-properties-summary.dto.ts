import { z } from 'zod';

export const getPropertiesSummarySchema = z.object({
  tenant_id: z.string().optional(),
  page_number: z.string().regex(/^\d+$/).optional().default('1'),
  page_size: z.string().regex(/^\d+$/).optional().default('10'),
  search: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking: z.string().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  property_type: z.string().optional(),
  move_in_date: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  radius: z.string().optional(),
});

export type GetPropertiesSummaryDto = z.infer<typeof getPropertiesSummarySchema>;