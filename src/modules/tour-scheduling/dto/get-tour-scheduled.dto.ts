import { z } from 'zod';

export const getTourScheduledSchema = z.object({
  tenant_id: z
    .string({
      required_error: 'Tenant ID is required',
      invalid_type_error: 'Tenant ID must be a string',
    })
    .min(1, 'Tenant ID is required'),
  property_id: z.string().optional(),
  agent_id: z.string().optional(),
});

export type GetTourScheduledDto = z.infer<typeof getTourScheduledSchema>;
