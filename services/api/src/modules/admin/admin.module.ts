import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserEntity } from '../../database/entities/user.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RestaurantEntity,
      DeliveryPartnerEntity,
      OrderEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
