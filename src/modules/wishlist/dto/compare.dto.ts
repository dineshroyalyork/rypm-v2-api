import { z } from 'zod';

export const compareSchema = z.object({
  property_ids: z.array(z.string().uuid('Invalid property_id')),
});

export type CompareDto = z.infer<typeof compareSchema>;
