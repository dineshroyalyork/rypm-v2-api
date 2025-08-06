import { RoommateRequestStatus } from '@/shared/enums/my-stays.enum';
import { z } from 'zod';

export const updateTenantStaySchema = z.object({
  stay_id: z.string({ message: 'Stay ID is required' }),
  status: z.enum(Object.values(RoommateRequestStatus) as [string, ...string[]], {
    message: 'Status must be ACCEPTED or REJECTED',
  }),
});

export type UpdateTenantStayDto = z.infer<typeof updateTenantStaySchema>;
