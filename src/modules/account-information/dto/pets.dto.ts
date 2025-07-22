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

export type PetsDto = z.infer<typeof petsSchema>; 