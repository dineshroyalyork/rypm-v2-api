import { z } from 'zod';

export const documentsSchema = z.object({
  credit_report_personal: z.string().optional(),
  government_id: z.string().optional(),
  bank_statements_personal: z.string().optional(),
  ownership_of_vehicle: z.string().optional(),
  credit_report_corporate: z.string().optional(),
  articles_of_incorporation: z.string().optional(),
  hst_tax_number: z.string().optional(),
  financial_statements: z.string().optional(),
  bank_statements_corporate: z.string().optional(),
});

export type DocumentsDto = z.infer<typeof documentsSchema>;
