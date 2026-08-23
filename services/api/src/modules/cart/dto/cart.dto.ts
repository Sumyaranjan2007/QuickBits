import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsString()
  restaurantId: string;

  @ApiProperty({ description: 'Menu item ID' })
  @IsString()
  menuItemId: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Addon IDs', example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addons?: string[];

  @ApiPropertyOptional({ example: 'No onions please' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;
}
