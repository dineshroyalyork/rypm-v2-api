import { z } from 'zod';

export const getListedPropertiesSchema = z.object({
  tenant_id: z.string().optional(),
  page_number: z.string().regex(/^\d+$/).optional().default('1'),
  page_size: z.string().regex(/^\d+$/).optional().default('10'),
  property_type: z.string().optional(),
  city: z.string().optional(),
});

export type GetListedPropertiesDto = z.infer<typeof getListedPropertiesSchema>; 