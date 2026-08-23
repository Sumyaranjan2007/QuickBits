import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@quickbite/types';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER50' })
  @IsString() @MaxLength(20)
  code: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 50 })
  @IsNumber() @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 199 })
  @IsOptional() @IsNumber() @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional() @IsNumber()
  maxDiscount?: number;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-01T00:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional() @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber() @Min(1)
  perUserLimit?: number;
}

export class UpdateCouponDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) value?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) minOrderAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxDiscount?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() usageLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) perUserLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'SUMMER50' })
  @IsString()
  code: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  orderAmount: number;
}
