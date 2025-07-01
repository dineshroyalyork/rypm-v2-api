import { z } from 'zod';

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'apple', 'facebook']),
  provider_id: z.string().min(1),
});

export type SocialLoginDto = z.infer<typeof socialLoginSchema>;