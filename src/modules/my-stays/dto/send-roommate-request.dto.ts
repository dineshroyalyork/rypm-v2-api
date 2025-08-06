import { z } from 'zod';

export const sendRoommateRequestSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  roommate_id: z.string({ message: 'Roommate ID is required' }),
  owner_id: z.string({ message: 'Owner ID is required' }).optional(),
});

export type SendRoommateRequestDto = z.infer<typeof sendRoommateRequestSchema>;
