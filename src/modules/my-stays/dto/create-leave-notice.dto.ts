import { z } from 'zod';

export const createLeaveNoticeSchema = z.object({
  property_id: z.string({ message: 'Property ID is required' }),
  owner_id: z.string({ message: 'Owner id should be string' }).optional(),
  address: z.string({ message: 'Address should be string' }).optional(),
  apt_unit: z.string({ message: 'Apt unit should be string' }).optional(),
  street_address: z.string({ message: 'Street address should be string' }).optional(),
  city: z.string({ message: 'City should be string' }).optional(),
  province: z.string({ message: 'Province should be string' }).optional(),
  postal_code: z.string({ message: 'Postal code should be string' }).optional(),
  country: z.string({ message: 'Country should be string' }).optional(),
  move_out_date: z.string({ message: 'Move out date should be string' }).optional(),
  reason_for_leaving: z.string({ message: 'Reason for leaving should be string' }).optional(),
  write_reason: z.string({ message: 'Write reason should be string' }).optional(),
  land_lord_name: z.string({ message: 'Landlord name should be string' }).optional(),
  is_n9_form_signed: z.boolean({ message: 'Is n9 form signed should be boolean' }).optional(),
});

export type CreateLeaveNoticeDto = z.infer<typeof createLeaveNoticeSchema>;
