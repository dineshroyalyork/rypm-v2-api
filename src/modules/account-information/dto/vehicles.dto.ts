import { z } from 'zod';

export const vehicleSchema = z.object({
  type: z.string().optional(), // Car, Motorcycle, etc.
  make: z.string().optional(), // Manufacturer (e.g., Honda)
  model: z.string().optional(), // Model of the vehicle (e.g., Civic)
  license_plate: z.string().optional(), // Vehicle's license plate
  car_ownership: z.string().optional(), // Own, Lease, etc.
});

export const vehiclesArraySchema = z.array(vehicleSchema);

export type VehicleDto = z.infer<typeof vehicleSchema>;
export type VehiclesDto = z.infer<typeof vehiclesArraySchema>; 