import { z } from 'zod';

export const createFirstAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['SUPER_ADMIN']).default('SUPER_ADMIN'),
  is_active: z.boolean().default(true),
  // Security key to prevent unauthorized creation
  security_key: z.string().min(1, 'Security key is required'),
});

export type CreateFirstAdminDto = z.infer<typeof createFirstAdminSchema>; 