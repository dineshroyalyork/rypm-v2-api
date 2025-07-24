import { z } from 'zod';

// Schema for creating property attachment with file upload
export const createPropertyAttachmentSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  label: z.string().min(1, 'Label is required').max(100, 'Label must be less than 100 characters'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
});

// Schema for getting property attachments by property ID
export const getPropertyAttachmentsSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  category: z.string().optional(), // Optional filter by category
});

// Types
export type CreatePropertyAttachmentDto = z.infer<typeof createPropertyAttachmentSchema>;
export type GetPropertyAttachmentsDto = z.infer<typeof getPropertyAttachmentsSchema>;
