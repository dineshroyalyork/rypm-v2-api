import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>; 