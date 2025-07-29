import { z } from 'zod';

export const deleteDocumentSchema = z.object({
  type: z.string().min(1, 'Document type is required'),
  sub_type: z.string().optional(),
});

export type DeleteDocumentDto = z.infer<typeof deleteDocumentSchema>; 