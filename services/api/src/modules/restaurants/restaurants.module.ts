import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { MenuCategoryEntity } from '../../database/entities/menu-category.entity';
import { MenuItemEntity } from '../../database/entities/menu-item.entity';
import { MenuItemAddonEntity } from '../../database/entities/menu-item-addon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RestaurantEntity,
      MenuCategoryEntity,
      MenuItemEntity,
      MenuItemAddonEntity,
    ]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
