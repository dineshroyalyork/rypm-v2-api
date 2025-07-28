import { z } from 'zod';
import { HousingStatus } from '@/shared/enums/account-details.enum';

export const housingInformationSchema = z
  .object({
    // Address information
    address_line_1: z.string().min(1, 'Street address is required').max(100, 'Address must be less than 100 characters').optional(),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters').optional(),
    province: z.string().min(1, 'Province is required').max(50, 'Province must be less than 50 characters').optional(),
    postal_code: z.string().regex(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/, 'Postal code must be in format: A1A 1A1').optional(),
    country: z.string().min(1, 'Country is required').max(50, 'Country must be less than 50 characters').optional(),

    // Housing status
    housing_status: z.nativeEnum(HousingStatus).refine(val => val !== undefined, {
      message: 'Please select your housing status',
    }),
    living_since: z.string().optional(),

    // Conditional fields based on housing status
    // For RENTING
    landlord_first_name: z.string().optional(),
    landlord_Last_name: z.string().optional(),
    landlord_phone_number: z.string().optional(),
    landlord_country_code: z.string().optional(),
    landlord_email: z.string().email('Please enter a valid email address').optional(),
    rent_amount: z.number().positive('Rent amount must be positive').optional(),

    // For OWNED with mortgage
    mortgage_amount: z.number().positive('Mortgage amount must be positive').optional(),
    payment_obligation: z.boolean().optional(),

    // Property features
    bedroom: z.number().int().min(0, 'Bedroom count must be 0 or more').max(10, 'Bedroom count must be 10 or less').optional(),
    bathroom: z.number().int().min(0, 'Bathroom count must be 0 or more').max(10, 'Bathroom count must be 10 or less').optional(),
  })
  .superRefine((data, ctx) => {
    // Validate conditional fields based on housing status
    switch (data.housing_status) {
      case HousingStatus.RENTING:
        if (!data.landlord_first_name || !data.landlord_Last_name || !data.landlord_phone_number || !data.rent_amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Landlord information and rent amount are required for renting status',
            path: ['landlord_first_name'],
          });
        }
        break;

      case HousingStatus.OWNED_MORTGAGE:
        if (!data.mortgage_amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Mortgage amount is required for owned with mortgage status',
            path: ['mortgage_amount'],
          });
        }
        break;

      case HousingStatus.OWNED_FREE:
        if (!data.living_since) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Living since is required for owned with mortgage status',
            path: ['living_since'],
          });
        }
        break;

      case HousingStatus.FAMILY_FRIENDS:
        if (!data.living_since || !data.rent_amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Living since and rent amount are required for living with family/friends status',
            path: ['living_since', 'rent_amount'],
          });
        }
        break;

      case HousingStatus.SHELTER:
        if (!data.living_since) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Living since is required for shelter status',
            path: ['living_since'],
          });
        }
        break;

      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid housing status selected',
          path: ['housing_status'],
        });
    }
  });

export type HousingInformationDto = z.infer<typeof housingInformationSchema>;
