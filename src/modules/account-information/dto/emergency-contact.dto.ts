import { z } from 'zod';

export const emergencyContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  relationship: z.string().min(1, 'Relationship is required').max(50, 'Relationship must be less than 50 characters'),
});

export type EmergencyContactDto = z.infer<typeof emergencyContactSchema>; 