import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CouponEntity } from '../../database/entities/coupon.entity';
import { CouponUsageEntity } from '../../database/entities/coupon-usage.entity';
import { CouponType } from '@quickbite/types';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
    @InjectRepository(CouponUsageEntity)
    private readonly couponUsageRepo: Repository<CouponUsageEntity>,
  ) {}

  // ─── Admin CRUD ────────────────────────────────────────

  async findAll() {
    return this.couponRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findActive() {
    const now = new Date();
    return this.couponRepo.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async create(adminId: string, dto: CreateCouponDto) {
    const existing = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Coupon code already exists');

    const coupon = this.couponRepo.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      createdBy: adminId,
    });
    return this.couponRepo.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (dto.startDate) coupon.startDate = new Date(dto.startDate);
    if (dto.endDate) coupon.endDate = new Date(dto.endDate);
    const { startDate, endDate, ...rest } = dto;
    Object.assign(coupon, rest);
    return this.couponRepo.save(coupon);
  }

  async delete(id: string) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.couponRepo.remove(coupon);
    return { message: 'Coupon deleted' };
  }

  // ─── Validation & Application ──────────────────────────

  async validate(userId: string, dto: ValidateCouponDto) {
    const coupon = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    this.validateCouponRules(coupon, dto.orderAmount);
    await this.validateUserUsage(coupon, userId);

    const discount = this.calculateDiscount(coupon, dto.orderAmount);
    return { coupon, discount };
  }

  async recordUsage(couponId: string, userId: string, orderId: string, discountAmount = 0) {
    await this.couponUsageRepo.save(this.couponUsageRepo.create({
      couponId,
      userId,
      orderId,
      discountAmount,
    }));
    await this.couponRepo.increment({ id: couponId }, 'currentUsage', 1);
  }

  calculateDiscount(coupon: CouponEntity, orderAmount: number): number {
    let discount: number;

    if (coupon.type === CouponType.PERCENTAGE) {
      discount = Math.round(orderAmount * Number(coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.value);
    }

    return Math.min(discount, orderAmount);
  }

  // ─── Helpers ───────────────────────────────────────────

  private validateCouponRules(coupon: CouponEntity, orderAmount: number) {
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is no longer active');
    }
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Coupon has expired or is not yet valid');
    }
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount is ₹${coupon.minOrderAmount}`,
      );
    }
  }

  private async validateUserUsage(coupon: CouponEntity, userId: string) {
    const userUsageCount = await this.couponUsageRepo.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsageCount >= coupon.perUserLimit) {
      throw new BadRequestException('You have already used this coupon the maximum number of times');
    }
  }
}
