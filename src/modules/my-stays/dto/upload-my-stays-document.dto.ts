import { MyStaysDocumentType } from '@/shared/enums/my-stays.enum';
import { z } from 'zod';

export const uploadMyStaysDocumentSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  owner_id: z.string({ message: 'Owner id should be string' }).optional(),
  is_uploaded: z.boolean({ message: 'Is uploaded should be boolean' }).optional(),
  document_type: z.nativeEnum(MyStaysDocumentType, {
    message: `Document type should be one of the following: ${Object.values(MyStaysDocumentType).join(', ')}`,
  }),
});

export type UploadMyStaysDocumentDto = z.infer<typeof uploadMyStaysDocumentSchema>;
