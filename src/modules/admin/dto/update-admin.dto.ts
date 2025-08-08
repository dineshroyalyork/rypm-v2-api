import { z } from 'zod';

export const updateAdminSchema = z.object({
  id: z.string().uuid('Invalid admin ID'),
  email: z.string().email('Invalid email format').optional(),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['SUPER_ADMIN']).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateAdminDto = z.infer<typeof updateAdminSchema>; 