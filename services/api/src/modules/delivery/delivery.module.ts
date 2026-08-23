import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { DeliveryAssignmentEntity } from '../../database/entities/delivery-assignment.entity';
import { DeliveryLocationEntity } from '../../database/entities/delivery-location.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderStatusHistoryEntity } from '../../database/entities/order-status-history.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryPartnerEntity,
      DeliveryAssignmentEntity,
      DeliveryLocationEntity,
      OrderEntity,
      OrderStatusHistoryEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
