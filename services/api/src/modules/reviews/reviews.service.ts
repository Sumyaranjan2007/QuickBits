import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from '../../database/entities/review.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { OrderStatus } from '@quickbite/types';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepo: Repository<ReviewEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(DeliveryPartnerEntity)
    private readonly deliveryPartnerRepo: Repository<DeliveryPartnerEntity>,
  ) {}

  async create(customerId: string, dto: CreateReviewDto) {
    // Verify order exists, belongs to customer, and is delivered
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new BadRequestException('Not your order');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Can only review delivered orders');
    }

    // Check for existing review
    const existing = await this.reviewRepo.findOne({ where: { orderId: dto.orderId } });
    if (existing) throw new ConflictException('You have already reviewed this order');

    // Create review
    const review = this.reviewRepo.create({
      orderId: dto.orderId,
      customerId,
      restaurantId: order.restaurantId,
      deliveryPartnerId: order.deliveryPartnerId,
      restaurantRating: dto.restaurantRating,
      foodRating: dto.foodRating,
      deliveryRating: dto.deliveryRating || null,
      comment: dto.comment || null,
    });
    const saved = await this.reviewRepo.save(review);

    // Update restaurant average rating
    await this.updateRestaurantRating(order.restaurantId);

    // Update delivery partner rating if applicable
    if (dto.deliveryRating && order.deliveryPartnerId) {
      await this.updateDeliveryPartnerRating(order.deliveryPartnerId);
    }

    return saved;
  }

  async findByRestaurant(restaurantId: string, limit = 20) {
    return this.reviewRepo.find({
      where: { restaurantId },
      relations: ['customer', 'customer.profile'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByOrder(orderId: string) {
    return this.reviewRepo.findOne({ where: { orderId } });
  }

  private async updateRestaurantRating(restaurantId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.restaurant_rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.restaurant_id = :restaurantId', { restaurantId })
      .getRawOne();

    await this.restaurantRepo.update(restaurantId, {
      rating: parseFloat(result.avg) || 0,
      totalRatings: parseInt(result.count) || 0,
    });
  }

  private async updateDeliveryPartnerRating(deliveryPartnerId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.delivery_rating)', 'avg')
      .where('r.delivery_partner_id = :deliveryPartnerId', { deliveryPartnerId })
      .andWhere('r.delivery_rating IS NOT NULL')
      .getRawOne();

    if (result.avg) {
      // Need to find partner by userId
      await this.deliveryPartnerRepo.update(
        { userId: deliveryPartnerId },
        { rating: parseFloat(result.avg) },
      );
    }
  }
}
