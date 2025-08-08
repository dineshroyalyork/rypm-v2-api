import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  verification_code: z.string().min(6, 'Verification code must be at least 6 characters'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>; 