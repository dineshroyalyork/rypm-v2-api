import { z } from 'zod';

export const createAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['SUPER_ADMIN']).default('SUPER_ADMIN'),
  is_active: z.boolean().default(true),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>; 