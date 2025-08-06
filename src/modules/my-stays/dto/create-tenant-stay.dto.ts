import { z } from 'zod';

export const createTenantStaySchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  owner_id: z.string({ message: 'Owner ID is required' }),
  monthly_rent: z.number({ message: 'Monthly rent is required' }).optional(),
  move_in_date: z.string({ message: 'Move in date should be in Date format' }).optional(),
  additional_monthly_rent: z.number().optional(),
  contingencies: z.string().optional(),
  deposit_amount: z.number().optional(),
  terms_and_conditions: z.boolean({ message: 'Terms and conditions should be a boolean' }).optional(),
  offer_cancellation_policy: z.boolean({ message: 'Offer cancellation policy should be a boolean' }).optional(),
});

export type CreateTenantStayDto = z.infer<typeof createTenantStaySchema>;
