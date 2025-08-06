import { ResidenceType } from '@/shared/enums/my-stays.enum';
import { z } from 'zod';

export const createResidentSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  owner_id: z.string({ message: 'Owner ID should be a string' }).optional(),
  // Personal Details
  first_name: z.string({ message: 'First name should be a string' }).optional(),
  middle_name: z.string({ message: 'Middle name should be a string' }).optional(),
  sur_name: z.string({ message: 'Sur name should be a string' }).optional(),
  email: z.string({ message: 'Email should be like example@example.com' }).optional(),
  phone_number: z.string({ message: 'Phone number should be a string' }).optional(),
  country_code: z.string({ message: 'Country code should be a string' }).optional(),
  gender: z.string({ message: 'Gender should be a string' }).optional(),
  profile_picture: z.string({ message: 'Profile picture should be a string' }).optional(),
  marital_status: z.string({ message: 'Marital status should be a string' }).optional(),
  credit_score: z.string({ message: 'Credit score should be a string' }).optional(),
  government_id_number: z.string({ message: 'Government ID number should be a string' }).optional(),
  social_insurance_number: z.string({ message: 'Social insurance number should be a string' }).optional(),
  residence_type: z.nativeEnum(ResidenceType, { message: 'Residence type should be a TENANT or OWNER' }).optional(),
  // Income Details
  source_of_income: z.string({ message: 'Source of income should be a string' }).optional(),
  employment_type: z.string({ message: 'Employment type should be a string' }).optional(),
  occupation: z.string({ message: 'Occupation should be a string' }).optional(),
  current_role: z.string({ message: 'Current role should be a string' }).optional(),
  monthly_income: z.number({ message: 'Monthly income must be positive' }).optional(),
  // Employment details
  who_you_work_for: z.string({ message: 'Who you work for should be a string' }).optional(),
  start_date: z.string().optional(),
  manager_name: z.string({ message: 'Manager name should be a string' }).optional(),
  manager_phone_number: z.string({ message: 'Manager phone number should be a string' }).optional(),
  manager_country_code: z.string({ message: 'Manager country code should be a string' }).optional(),
  manager_email: z.string({ message: 'Manager email should be like example@example.com' }).optional(),
});

export type CreateResidentDto = z.infer<typeof createResidentSchema>;
