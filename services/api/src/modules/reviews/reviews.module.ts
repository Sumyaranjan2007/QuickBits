import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewEntity } from '../../database/entities/review.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReviewEntity,
      OrderEntity,
      RestaurantEntity,
      DeliveryPartnerEntity,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
