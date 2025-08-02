import { z } from 'zod';

// Schema for a single identity verification record
export const identityVerificationSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  sub_type: z.string().min(1, 'Sub type is required'),
  url: z.string().optional(),
  image_id: z.string().optional(),
  status: z.enum(['pending', 'verified', 'rejected']).optional().default('pending'),
  notes: z.string().optional(),
});

// Schema for multiple identity verification records
export const identityVerificationArraySchema = z.array(identityVerificationSchema);

// Schema for uploading identity verification
export const uploadIdentityVerificationSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  sub_type: z.string().min(1, 'Sub type is required'),
});

// Schema for deleting identity verification
export const deleteIdentityVerificationSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export type IdentityVerificationDto = z.infer<typeof identityVerificationSchema>;
export type IdentityVerificationArrayDto = z.infer<typeof identityVerificationArraySchema>;
export type UploadIdentityVerificationDto = z.infer<typeof uploadIdentityVerificationSchema>;
export type DeleteIdentityVerificationDto = z.infer<typeof deleteIdentityVerificationSchema>; 