import { RoommateRequestStatus } from '@/shared/enums/my-stays.enum';
import { z } from 'zod';

export const updateRoommateRequestSchema = z.object({
  request_id: z.string({ message: 'Request ID is required' }),
  status: z.enum(Object.values(RoommateRequestStatus) as [string, ...string[]], {
    message: 'Status must be ACCEPTED or REJECTED',
  }),
});

export type UpdateRoommateRequestDto = z.infer<typeof updateRoommateRequestSchema>;
