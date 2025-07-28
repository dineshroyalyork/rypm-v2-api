import { z } from 'zod';

export const vehiclesSchema = z.object({
  type: z.string().optional(), // Car, Motorcycle, etc.
  make: z.string().optional(), // Manufacturer (e.g., Honda)
  model: z.string().optional(), // Model of the vehicle (e.g., Civic)
  license_plate: z.string().optional(), // Vehicle's license plate
  car_ownership: z.string().optional(), // Own, Lease, etc.
});

export type VehiclesDto = z.infer<typeof vehiclesSchema>; 