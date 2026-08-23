import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartEntity } from '../../database/entities/cart.entity';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { MenuItemEntity } from '../../database/entities/menu-item.entity';
import { MenuItemAddonEntity } from '../../database/entities/menu-item-addon.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      MenuItemEntity,
      MenuItemAddonEntity,
      RestaurantEntity,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
