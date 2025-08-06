import { z } from 'zod';
import { RoommateRequestStatus } from '@/shared/enums/my-stays.enum';

export const getRoommateRequestsSchema = z.object({
  status: z.enum(Object.values(RoommateRequestStatus) as [string, ...string[]]).optional(),
});

export type GetRoommateRequestsDto = z.infer<typeof getRoommateRequestsSchema>;
