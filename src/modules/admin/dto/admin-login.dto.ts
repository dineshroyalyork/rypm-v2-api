import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginDto = z.infer<typeof adminLoginSchema>; 