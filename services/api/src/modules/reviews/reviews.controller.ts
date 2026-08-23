import { Inject, Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit a review (customer, after delivery)' })
  async create(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<IApiResponse> {
    const data = await this.reviewsService.create(customerId, dto);
    return { success: true, data, message: 'Review submitted' };
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get reviews for a restaurant (public)' })
  async findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<IApiResponse> {
    const data = await this.reviewsService.findByRestaurant(restaurantId);
    return { success: true, data, message: 'Reviews retrieved' };
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get review for an order' })
  async findByOrder(@Param('orderId') orderId: string): Promise<IApiResponse> {
    const data = await this.reviewsService.findByOrder(orderId);
    return { success: true, data, message: data ? 'Review retrieved' : 'No review yet' };
  }
}
