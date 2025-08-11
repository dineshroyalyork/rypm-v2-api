import { z } from 'zod';

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'LEASING_AGENT']).optional(),
  phone_number: z.string().optional(),
  country_code: z.string().optional(),
  is_active: z.boolean().optional(),
  manager_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>; 