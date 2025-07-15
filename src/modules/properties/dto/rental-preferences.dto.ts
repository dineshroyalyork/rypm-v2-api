import { IsNumber, IsOptional, IsString, IsArray, IsDateString, Min, Max, ValidateIf } from 'class-validator';

export class RentalPreferencesDto {
  @IsNumber()
  @Min(0)
  price_min: number;

  @IsNumber()
  @Min(0)
  price_max: number;

  @IsString()
  bedrooms: string; // e.g., 'Studio+', '1+', etc.

  @IsString()
  bathrooms: string; // e.g., 'All', '1+', etc.

  @IsString()
  parking: string; // e.g., 'All', '1+', etc.

  @IsString()
  @IsOptional()
  property_type?: string;

  @IsString()
  @IsOptional()
  move_in_date?: string; // ISO date string or dd/mm/yyyy
} 