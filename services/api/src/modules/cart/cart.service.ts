import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '../../database/entities/cart.entity';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { MenuItemEntity } from '../../database/entities/menu-item.entity';
import { MenuItemAddonEntity } from '../../database/entities/menu-item-addon.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { PLATFORM_FEE_PERCENTAGE, TAX_RATE } from '@quickbite/config';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(MenuItemAddonEntity)
    private readonly addonRepo: Repository<MenuItemAddonEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
  ) {}

  async getCart(customerId: string) {
    const cart = await this.cartRepo.findOne({
      where: { customerId },
      relations: ['items', 'items.menuItem', 'items.menuItem.addons', 'restaurant'],
    });

    if (!cart || !cart.items.length) {
      return { cart: null, summary: null };
    }

    const summary = await this.calculateCartSummary(cart);
    return { cart, summary };
  }

  async addItem(customerId: string, dto: AddToCartDto) {
    // Validate restaurant exists and is active
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurantId, isActive: true },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found or inactive');

    // Validate menu item
    const menuItem = await this.menuItemRepo.findOne({
      where: { id: dto.menuItemId, restaurantId: dto.restaurantId, isAvailable: true },
    });
    if (!menuItem) throw new NotFoundException('Menu item not found or unavailable');

    // Get or create cart — if existing cart is from a different restaurant, clear it
    let cart = await this.cartRepo.findOne({
      where: { customerId },
      relations: ['items'],
    });

    if (cart && cart.restaurantId !== dto.restaurantId) {
      // Different restaurant — clear existing cart
      await this.cartItemRepo.delete({ cartId: cart.id });
      cart.restaurantId = dto.restaurantId;
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    if (!cart) {
      cart = this.cartRepo.create({
        customerId,
        restaurantId: dto.restaurantId,
      });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    // Check if item already in cart (same menu item and addons)
    const existingItem = cart.items.find(
      (item) => item.menuItemId === dto.menuItemId &&
        JSON.stringify(item.addons.sort()) === JSON.stringify((dto.addons || []).sort()),
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity || 1;
      if (dto.specialInstructions) existingItem.specialInstructions = dto.specialInstructions;
      await this.cartItemRepo.save(existingItem);
    } else {
      const cartItem = this.cartItemRepo.create({
        cartId: cart.id,
        menuItemId: dto.menuItemId,
        quantity: dto.quantity || 1,
        addons: dto.addons || [],
        specialInstructions: dto.specialInstructions || null,
      });
      await this.cartItemRepo.save(cartItem);
    }

    return this.getCart(customerId);
  }

  async updateItemQuantity(customerId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartRepo.findOne({ where: { customerId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.cartItemRepo.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      await this.cartItemRepo.remove(item);
      // If cart is now empty, delete it
      const remaining = await this.cartItemRepo.count({ where: { cartId: cart.id } });
      if (remaining === 0) {
        await this.cartRepo.remove(cart);
        return { cart: null, summary: null };
      }
    } else {
      item.quantity = dto.quantity;
      await this.cartItemRepo.save(item);
    }

    return this.getCart(customerId);
  }

  async removeItem(customerId: string, cartItemId: string) {
    return this.updateItemQuantity(customerId, cartItemId, { quantity: 0 });
  }

  async clearCart(customerId: string) {
    const cart = await this.cartRepo.findOne({ where: { customerId } });
    if (cart) {
      await this.cartItemRepo.delete({ cartId: cart.id });
      await this.cartRepo.remove(cart);
    }
    return { message: 'Cart cleared' };
  }

  /**
   * Calculate subtotal, fees, taxes, and total for the cart.
   */
  async calculateCartSummary(cart: CartEntity) {
    let subtotal = 0;

    for (const item of cart.items) {
      let itemPrice = Number(item.menuItem.price) * item.quantity;

      // Calculate addon prices
      if (item.addons && item.addons.length > 0) {
        const addons = await this.addonRepo.findByIds(item.addons);
        const addonTotal = addons.reduce((sum, a) => sum + Number(a.price), 0);
        itemPrice += addonTotal * item.quantity;
      }

      subtotal += itemPrice;
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: { id: cart.restaurantId },
    });

    const deliveryFee = Number(restaurant?.deliveryFee || 30);
    const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENTAGE / 100);
    const tax = Math.round(subtotal * TAX_RATE / 100);
    const total = subtotal + deliveryFee + platformFee + tax;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      discount: 0,
      total,
      itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }
}
