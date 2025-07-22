import { z } from 'zod';

export const bankDetailsSchema = z.object({
  account_holder_name: z.string().min(1, 'Account holder name is required').max(100, 'Account holder name must be less than 100 characters'),
  bank_name: z.string().min(1, 'Bank name is required').max(100, 'Bank name must be less than 100 characters'),
  institution_number: z.string().min(3, 'Institution number is required').max(3, 'Institution number must be 3 digits'),
  transit_number: z.string().min(5, 'Transit number is required').max(5, 'Transit number must be 5 digits'),
  account_number: z.string().min(4, 'Account number is required').max(34, 'Account number must be less than 34 characters'),
  direct_deposit_form: z.string().optional(),
  branch_address: z.string().min(1, 'Branch address is required').max(200, 'Branch address must be less than 200 characters'),
});

export type BankDetailsDto = z.infer<typeof bankDetailsSchema>; 