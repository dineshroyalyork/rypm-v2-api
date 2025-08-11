import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'LEASING_AGENT']),
  phone_number: z.string().optional(),
  country_code: z.string().optional(),
  manager_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>; 