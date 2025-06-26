import { z } from 'zod';

export const updateNotificationsSchema = z.object({
  notifications_enabled: z.boolean(),
});

export type UpdateNotificationsDto = z.infer<typeof updateNotificationsSchema>;
