import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  restaurantRating: number;

  @ApiProperty({ example: 4.0, minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  foodRating: number;

  @ApiPropertyOptional({ example: 5.0, minimum: 1, maximum: 5 })
  @IsOptional() @IsNumber() @Min(1) @Max(5)
  deliveryRating?: number;

  @ApiPropertyOptional({ example: 'Great food, fast delivery!' })
  @IsOptional() @IsString()
  comment?: string;
}
