import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FoodType } from '@quickbite/types';

// ─── Restaurant DTOs ─────────────────────────────────────
export class CreateRestaurantDto {
  @ApiProperty({ example: 'Spice Garden' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Authentic North Indian cuisine' })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ example: '42 MG Road, Bangalore' })
  @IsString()
  address: string;

  @ApiProperty({ example: '+919800000001' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '10:00' })
  @IsString()
  openingHours: string;

  @ApiProperty({ example: '23:00' })
  @IsString()
  closingHours: string;

  @ApiProperty({ example: ['North Indian', 'Mughlai'] })
  @IsArray() @IsString({ each: true })
  cuisineType: string[];

  @ApiPropertyOptional({ example: 150 })
  @IsOptional() @IsNumber() @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional() @IsNumber() @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional() @IsNumber() @Min(0)
  avgDeliveryTime?: number;
}

export class UpdateRestaurantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  latitude?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  longitude?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  openingHours?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  closingHours?: string;

  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true })
  cuisineType?: string[];

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  avgDeliveryTime?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  logoUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  coverImageUrl?: string;
}

// ─── Menu Category DTOs ──────────────────────────────────
export class CreateMenuCategoryDto {
  @ApiProperty({ example: 'Starters' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsNumber()
  sortOrder?: number;
}

export class UpdateMenuCategoryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isActive?: boolean;
}

// ─── Menu Item DTOs ──────────────────────────────────────
export class CreateMenuItemDto {
  @ApiProperty({ example: 'Paneer Tikka' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ example: 249 })
  @IsNumber() @Min(0)
  price: number;

  @ApiProperty({ enum: FoodType, example: FoodType.VEG })
  @IsEnum(FoodType)
  foodType: FoodType;

  @ApiProperty({ description: 'Menu category ID' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  sortOrder?: number;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: FoodType }) @IsOptional() @IsEnum(FoodType)
  foodType?: FoodType;

  @ApiPropertyOptional() @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  sortOrder?: number;
}

// ─── Menu Item Addon DTOs ────────────────────────────────
export class CreateAddonDto {
  @ApiProperty({ example: 'Extra Cheese' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiProperty({ example: 30 })
  @IsNumber() @Min(0)
  price: number;
}

export class UpdateAddonDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isAvailable?: boolean;
}

// ─── Query DTOs ──────────────────────────────────────────
export class RestaurantQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional() @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'pizza' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Italian' })
  @IsOptional() @IsString()
  cuisine?: string;

  @ApiPropertyOptional({ enum: FoodType })
  @IsOptional() @IsEnum(FoodType)
  foodType?: FoodType;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional() @IsNumber()
  minRating?: number;

  @ApiPropertyOptional({ example: 'rating' })
  @IsOptional() @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional() @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
