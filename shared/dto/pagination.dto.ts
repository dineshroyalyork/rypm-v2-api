import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number({ message: 'Page must be a number' }).min(1, 'Page must be at least 1').optional().default(1),
  limit: z
    .number({ message: 'Limit must be a number' })
    .min(1, 'Limit must be at least 1')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .default(10),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
