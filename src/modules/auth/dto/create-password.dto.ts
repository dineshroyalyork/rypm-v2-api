import { z } from 'zod';

export const createPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include at least 1 uppercase letter')
    .regex(/[a-z]/, 'Must include at least 1 lowercase letter')
    .regex(/[0-9]/, 'Must include at least 1 number')
    .regex(/[@$!%*?&]/, 'Must include at least 1 special character'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type CreatePasswordDto = z.infer<typeof createPasswordSchema>;
