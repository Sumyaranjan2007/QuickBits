import { Inject, Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(@Inject(CouponsService) private readonly couponsService: CouponsService) {}

  // ─── Customer Endpoints ────────────────────────────────

  @Get('active')
  @ApiOperation({ summary: 'Get active coupons (public)' })
  async findActive(): Promise<IApiResponse> {
    const data = await this.couponsService.findActive();
    return { success: true, data, message: 'Active coupons retrieved' };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Validate coupon for order' })
  async validate(
    @CurrentUser('id') userId: string,
    @Body() dto: ValidateCouponDto,
  ): Promise<IApiResponse> {
    const data = await this.couponsService.validate(userId, dto);
    return { success: true, data, message: 'Coupon is valid' };
  }

  // ─── Admin Endpoints ───────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all coupons (admin)' })
  async findAll(): Promise<IApiResponse> {
    const data = await this.couponsService.findAll();
    return { success: true, data, message: 'All coupons retrieved' };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create coupon (admin)' })
  async create(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateCouponDto,
  ): Promise<IApiResponse> {
    const data = await this.couponsService.create(adminId, dto);
    return { success: true, data, message: 'Coupon created' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update coupon (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ): Promise<IApiResponse> {
    const data = await this.couponsService.update(id, dto);
    return { success: true, data, message: 'Coupon updated' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete coupon (admin)' })
  async delete(@Param('id') id: string): Promise<IApiResponse> {
    const data = await this.couponsService.delete(id);
    return { success: true, data, message: data.message };
  }
}
