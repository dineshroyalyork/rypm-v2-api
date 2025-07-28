import { z } from 'zod';

export const personalInformationSchema = z.object({
  // Legal name
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  middle_name: z.string().optional(),
  sur_name: z.string().min(1, 'Surname is required').max(50, 'Surname must be less than 50 characters'),

  // Contact information
  email: z.string().email('Please enter a valid email address'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  country_code: z.string().min(1, 'Country code is required'),

  // Demographics
  gender: z.string().min(1, 'Please select your gender'),
  marital_status: z.string().min(1, 'Please select your marital status'),
  credit_score: z.string().optional(),

  // Government ID
  government_id_name: z.string().min(1, 'Please select your government ID type'),
  government_id_number: z.string().min(1, 'Government ID number is required').max(50, 'ID number must be less than 50 characters'),
  social_insurance_number: z.string().regex(/^\d{3}\s\d{3}\s\d{3}$/, 'SIN must be in format: 999 999 999'),
});

export type PersonalInformationDto = z.infer<typeof personalInformationSchema>;
