import { z } from 'zod';

export const createTourScheduledSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  agent_id: z.string().optional(),
  move_in_date: z.string().datetime('Invalid date format').optional(),
  monthly_income: z.number().min(0, 'Monthly income must be positive').optional(),
  credit_score: z.number().min(300, 'Credit score must be at least 300').max(850, 'Credit score must be at most 850').optional(),
  source_of_income: z.string().optional(),
  occupation: z.string().optional(),
});

export type CreateTourScheduledDto = z.infer<typeof createTourScheduledSchema>;
