import { z } from 'zod';

export const getUsersSchema = z.object({
  page_number: z.string().regex(/^\d+$/).optional().default('1'),
  page_size: z.string().regex(/^\d+$/).optional().default('10'),
  role: z.enum(['MANAGER', 'AGENT']).optional(),
  is_active: z.string().optional(),
  search: z.string().optional(),
});

export type GetUsersDto = z.infer<typeof getUsersSchema>; 