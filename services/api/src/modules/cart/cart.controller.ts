import { Inject, Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('cart')
export class CartController {
  constructor(@Inject(CartService) private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  async getCart(@CurrentUser('id') customerId: string): Promise<IApiResponse> {
    const data = await this.cartService.getCart(customerId);
    return { success: true, data, message: 'Cart retrieved' };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser('id') customerId: string,
    @Body() dto: AddToCartDto,
  ): Promise<IApiResponse> {
    const data = await this.cartService.addItem(customerId, dto);
    return { success: true, data, message: 'Item added to cart' };
  }

  @Put('items/:cartItemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @CurrentUser('id') customerId: string,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<IApiResponse> {
    const data = await this.cartService.updateItemQuantity(customerId, cartItemId, dto);
    return { success: true, data, message: 'Cart updated' };
  }

  @Delete('items/:cartItemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @CurrentUser('id') customerId: string,
    @Param('cartItemId') cartItemId: string,
  ): Promise<IApiResponse> {
    const data = await this.cartService.removeItem(customerId, cartItemId);
    return { success: true, data, message: 'Item removed from cart' };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser('id') customerId: string): Promise<IApiResponse> {
    const data = await this.cartService.clearCart(customerId);
    return { success: true, data, message: data.message };
  }
}
