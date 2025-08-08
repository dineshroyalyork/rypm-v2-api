import { z } from 'zod';

export const getLeaveNoticesSchema = z.object({
  property_id: z.string({ message: 'Property id should be string' }).optional(),
});

export type GetLeaveNoticesDto = z.infer<typeof getLeaveNoticesSchema>;
