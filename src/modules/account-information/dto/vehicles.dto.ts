import { z } from 'zod';

export const vehiclesSchema = z.object({
  type: z.string(), // Car, Motorcycle, etc.
  make: z.string(), // Manufacturer (e.g., Honda)
  model: z.string(), // Model of the vehicle (e.g., Civic)
  license_plate: z.string(), // Vehicle's license plate
  car_ownership: z.string(), // Own, Lease, etc.
});

export type VehiclesDto = z.infer<typeof vehiclesSchema>; 