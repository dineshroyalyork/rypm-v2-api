import { z } from 'zod';

export const getAdminsSchema = z.object({
  page_number: z.string().regex(/^\d+$/).optional().default('1'),
  page_size: z.string().regex(/^\d+$/).optional().default('10'),
  role: z.enum(['SUPER_ADMIN']).optional(),
  is_active: z.string().optional(),
  search: z.string().optional(),
});

export type GetAdminsDto = z.infer<typeof getAdminsSchema>; 