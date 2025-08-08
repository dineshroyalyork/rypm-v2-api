import { z } from 'zod';

export const updateUserSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email format').optional(),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'AGENT']).optional(),
  phone_number: z.string().optional(),
  country_code: z.string().optional(),
  manager_id: z.string().uuid('Invalid manager ID').optional(), // For agents only
  is_active: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>; 