import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'AGENT']),
  phone_number: z.string().optional(),
  country_code: z.string().optional(),
  manager_id: z.string().uuid('Invalid manager ID').optional(), // For agents only
  is_active: z.boolean().default(true),
});

export type CreateUserDto = z.infer<typeof createUserSchema>; 