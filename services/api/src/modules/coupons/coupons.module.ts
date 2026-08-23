import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CouponEntity } from '../../database/entities/coupon.entity';
import { CouponUsageEntity } from '../../database/entities/coupon-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity, CouponUsageEntity])],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
