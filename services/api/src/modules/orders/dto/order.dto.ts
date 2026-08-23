import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '@quickbite/types';

export class CreateOrderDto {
  @ApiProperty({ description: 'Delivery address ID' })
  @IsUUID()
  deliveryAddressId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH_ON_DELIVERY })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'Ring the doorbell' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ example: 'WELCOME50' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional() @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional() @IsEnum(OrderStatus)
  status?: OrderStatus;
}
