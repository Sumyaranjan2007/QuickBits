import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType, DeliveryAssignmentStatus } from '@quickbite/types';

export class RegisterDeliveryPartnerDto {
  @ApiProperty({ enum: VehicleType, example: VehicleType.MOTORCYCLE })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty({ example: 'KA01AB1234' })
  @IsString()
  vehicleNumber: string;

  @ApiProperty({ example: 'DL12345678' })
  @IsString()
  licenseNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export class UpdateLocationDto {
  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  longitude: number;
}

export class ToggleOnlineDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isOnline: boolean;
}

export class UpdateAssignmentStatusDto {
  @ApiProperty({ enum: DeliveryAssignmentStatus })
  @IsEnum(DeliveryAssignmentStatus)
  status: DeliveryAssignmentStatus;
}
