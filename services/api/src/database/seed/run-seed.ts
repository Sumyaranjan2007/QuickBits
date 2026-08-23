import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { UserEntity } from '../entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { RestaurantEntity } from '../entities/restaurant.entity';
import { RestaurantStaffEntity } from '../entities/restaurant-staff.entity';
import { MenuCategoryEntity } from '../entities/menu-category.entity';
import { MenuItemEntity } from '../entities/menu-item.entity';
import { MenuItemAddonEntity } from '../entities/menu-item-addon.entity';
import { AddressEntity } from '../entities/address.entity';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatusHistoryEntity } from '../entities/order-status-history.entity';
import { DeliveryPartnerEntity } from '../entities/delivery-partner.entity';
import { DeliveryAssignmentEntity } from '../entities/delivery-assignment.entity';
import { DeliveryLocationEntity } from '../entities/delivery-location.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { RefundEntity } from '../entities/refund.entity';
import { CouponEntity } from '../entities/coupon.entity';
import { CouponUsageEntity } from '../entities/coupon-usage.entity';
import { ReviewEntity } from '../entities/review.entity';
import { NotificationEntity } from '../entities/notification.entity';
import { RestaurantPayoutEntity } from '../entities/restaurant-payout.entity';
import { DeliveryPayoutEntity } from '../entities/delivery-payout.entity';
import { seedDatabase } from './seed';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'quickbite',
  synchronize: true,
  entities: [
    UserEntity, ProfileEntity, CustomerEntity, RestaurantEntity, RestaurantStaffEntity,
    MenuCategoryEntity, MenuItemEntity, MenuItemAddonEntity, AddressEntity,
    CartEntity, CartItemEntity, OrderEntity, OrderItemEntity, OrderStatusHistoryEntity,
    DeliveryPartnerEntity, DeliveryAssignmentEntity, DeliveryLocationEntity,
    PaymentEntity, RefundEntity, CouponEntity, CouponUsageEntity,
    ReviewEntity, NotificationEntity, RestaurantPayoutEntity, DeliveryPayoutEntity,
  ],
});

async function run() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected\n');
    await seedDatabase(dataSource);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

run();
