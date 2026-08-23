import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { OrderStatusHistoryEntity } from '../../database/entities/order-status-history.entity';
import { CartEntity } from '../../database/entities/cart.entity';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { MenuItemEntity } from '../../database/entities/menu-item.entity';
import { MenuItemAddonEntity } from '../../database/entities/menu-item-addon.entity';
import { AddressEntity } from '../../database/entities/address.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      OrderStatusHistoryEntity,
      CartEntity,
      CartItemEntity,
      MenuItemEntity,
      MenuItemAddonEntity,
      AddressEntity,
      RestaurantEntity,
    ]),
    PaymentsModule,
    NotificationsModule,
    CouponsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
