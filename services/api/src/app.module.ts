import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MapsModule } from './modules/maps/maps.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AdminModule } from './modules/admin/admin.module';
import configuration from './config/configuration';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '@quickbite/config';

// Import all entities
import { UserEntity } from './database/entities/user.entity';
import { ProfileEntity } from './database/entities/profile.entity';
import { CustomerEntity } from './database/entities/customer.entity';
import { RestaurantEntity } from './database/entities/restaurant.entity';
import { RestaurantStaffEntity } from './database/entities/restaurant-staff.entity';
import { MenuCategoryEntity } from './database/entities/menu-category.entity';
import { MenuItemEntity } from './database/entities/menu-item.entity';
import { MenuItemAddonEntity } from './database/entities/menu-item-addon.entity';
import { AddressEntity } from './database/entities/address.entity';
import { CartEntity } from './database/entities/cart.entity';
import { CartItemEntity } from './database/entities/cart-item.entity';
import { OrderEntity } from './database/entities/order.entity';
import { OrderItemEntity } from './database/entities/order-item.entity';
import { OrderStatusHistoryEntity } from './database/entities/order-status-history.entity';
import { DeliveryPartnerEntity } from './database/entities/delivery-partner.entity';
import { DeliveryAssignmentEntity } from './database/entities/delivery-assignment.entity';
import { DeliveryLocationEntity } from './database/entities/delivery-location.entity';
import { PaymentEntity } from './database/entities/payment.entity';
import { RefundEntity } from './database/entities/refund.entity';
import { CouponEntity } from './database/entities/coupon.entity';
import { CouponUsageEntity } from './database/entities/coupon-usage.entity';
import { ReviewEntity } from './database/entities/review.entity';
import { NotificationEntity } from './database/entities/notification.entity';
import { RestaurantPayoutEntity } from './database/entities/restaurant-payout.entity';
import { DeliveryPayoutEntity } from './database/entities/delivery-payout.entity';

const entities = [
  UserEntity,
  ProfileEntity,
  CustomerEntity,
  RestaurantEntity,
  RestaurantStaffEntity,
  MenuCategoryEntity,
  MenuItemEntity,
  MenuItemAddonEntity,
  AddressEntity,
  CartEntity,
  CartItemEntity,
  OrderEntity,
  OrderItemEntity,
  OrderStatusHistoryEntity,
  DeliveryPartnerEntity,
  DeliveryAssignmentEntity,
  DeliveryLocationEntity,
  PaymentEntity,
  RefundEntity,
  CouponEntity,
  CouponUsageEntity,
  ReviewEntity,
  NotificationEntity,
  RestaurantPayoutEntity,
  DeliveryPayoutEntity,
];

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => {
        const dbType = configService.get('database.type') || 'sqlite';
        if (dbType === 'postgres') {
          return {
            type: 'postgres' as const,
            host: configService.get('database.host'),
            port: configService.get('database.port'),
            username: configService.get('database.username'),
            password: configService.get('database.password'),
            database: configService.get('database.database'),
            entities,
            synchronize: configService.get('database.synchronize'),
            logging: configService.get('database.logging'),
            ssl: configService.get('database.ssl') ? { rejectUnauthorized: false } : false,
          };
        }
        // SQLite for local development (no PostgreSQL needed)
        return {
          type: 'sqljs' as const,
          location: 'quickbite.db',
          autoSave: true,
          entities,
          synchronize: true,
          logging: ['query', 'error'],
        };
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: RATE_LIMIT_WINDOW_MS,
      limit: RATE_LIMIT_MAX_REQUESTS,
    }]),

    // Feature modules
    AuthModule,
    UsersModule,
    HealthModule,
    AddressesModule,
    RestaurantsModule,
    CartModule,
    CouponsModule,
    PaymentsModule,
    MapsModule,
    NotificationsModule,
    OrdersModule,
    DeliveryModule,
    ReviewsModule,
    RealtimeModule,
    AdminModule,
  ],
})
export class AppModule {}
