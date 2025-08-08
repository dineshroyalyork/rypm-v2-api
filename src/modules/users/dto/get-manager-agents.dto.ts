import { z } from 'zod';

export const getManagerAgentsSchema = z.object({
  manager_id: z.string().uuid('Invalid manager ID'),
  page_number: z.string().regex(/^\d+$/).optional().default('1'),
  page_size: z.string().regex(/^\d+$/).optional().default('10'),
  is_active: z.string().optional(),
  search: z.string().optional(),
});

export type GetManagerAgentsDto = z.infer<typeof getManagerAgentsSchema>; 