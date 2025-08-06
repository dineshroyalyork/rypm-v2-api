import { RoommateRequestStatus } from '@/shared/enums/my-stays.enum';
import { z } from 'zod';

export const getTenantStaysSchema = z.object({
  status: z.enum(Object.values(RoommateRequestStatus) as [string, ...string[]]).optional(),
});

export type GetTenantStaysDto = z.infer<typeof getTenantStaysSchema>;
