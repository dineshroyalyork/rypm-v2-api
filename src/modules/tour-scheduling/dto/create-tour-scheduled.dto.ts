import { z } from 'zod';

export const createTourScheduledSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  agent_id: z.string().optional(),
  move_in_date: z.string().datetime('Invalid date format').optional(),
  monthly_income: z.number().min(0, 'Monthly income must be positive').optional(),
  credit_score: z.string({ message: 'Credit score is in string format' }).optional(),
  source_of_income: z.string().optional(),
  occupation: z.string().optional(),
  status: z.string({ message: 'Status should be string' }).optional(),
});

export type CreateTourScheduledDto = z.infer<typeof createTourScheduledSchema>;
