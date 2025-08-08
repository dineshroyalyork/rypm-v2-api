import { z } from 'zod';

export const getMyStaysDocumentsSchema = z.object({
  property_id: z.string().optional(),
  document_type: z.string().optional(), // Filter by document type
  status: z.string().optional(), // Filter by status
});

export type GetMyStaysDocumentsDto = z.infer<typeof getMyStaysDocumentsSchema>;
