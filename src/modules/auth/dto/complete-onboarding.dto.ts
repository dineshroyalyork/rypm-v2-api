import { z } from 'zod';

export const completeOnboardingSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    // Conditional identity: either email or phone + code
    email: z.string().email('Invalid email'),
    country_code: z.string().min(1),
    phone_number: z.string().min(5),
    country_iso_code: z.string().optional(),  
    platform: z.enum(['ios', 'android', 'web'], { message: 'Invalid platform' }),
    device_token: z.string().min(10, 'Invalid device token'),
  })
  .refine(
    (data) => data.email || (data.phone_number && data.country_code),
    {
      message: 'Either email or phone number + country code is required',
    }
  );

export type CompleteOnboardingDto = z.infer<typeof completeOnboardingSchema>;
