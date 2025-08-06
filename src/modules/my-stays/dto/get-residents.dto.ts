import { z } from 'zod';
export const getResidentsSchema = z.object({
  property_id: z.string({ message: 'Property ID should be a string' }).optional(),
});

export type GetResidentsDto = z.infer<typeof getResidentsSchema>;
