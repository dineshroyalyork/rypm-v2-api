import { z } from 'zod';

export const emergencyContactSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits').optional(),
  country_code: z.string().optional(),
  relationship: z.string().optional(),
});

export type EmergencyContactDto = z.infer<typeof emergencyContactSchema>; 