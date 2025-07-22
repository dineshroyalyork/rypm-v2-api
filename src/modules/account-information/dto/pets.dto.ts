import { z } from 'zod';

export const petsSchema = z.object({
  has_pet: z.boolean(),
  pet_type: z.string(), // Could be enum: Dog, Cat, Bird, Hamster, Snake, Other
  breed_type: z.string().optional(),
  weight: z.string(),
  gender: z.string(), // Could be enum: Male, Female, Unknown
  is_neutered: z.boolean(),
  animal_description: z.string().optional(),
});

// Updated schema to support an array of pets
export const petsArraySchema = z.array(petsSchema);

// Updated type for the array of pets
export type PetsDto = z.infer<typeof petsArraySchema>;
