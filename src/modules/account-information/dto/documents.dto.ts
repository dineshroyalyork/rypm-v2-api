import { z } from 'zod';

export const documentsSchema = z.object({
  // Personal Documents
  credit_report_personal: z.string().optional(),

  canadian_id: z.string().optional(),
  secondary_id: z.string().optional(),

  income_letter_royal_york: z.string().optional(),
  income_letter_td_bank: z.string().optional(),

  pay_stub_1: z.string().optional(),
  pay_stub_2: z.string().optional(),
  pay_stub_3: z.string().optional(),
  

  bank_statement_30_days: z.string().optional(),
  bank_statement_60_days: z.string().optional(),
  bank_statement_90_days: z.string().optional(),

  vehicle_license_plate_1: z.string().optional(),
  vehicle_license_plate_2: z.string().optional(),

  // Corporate Documents
  corporate_credit_report: z.string().optional(),
  articles_of_incorporation: z.string().optional(),
  hst_tax_number: z.string().optional(),
  financial_statements: z.string().optional(),
  bank_statements: z.string().optional()
});

export type DocumentsDto = z.infer<typeof documentsSchema>;
