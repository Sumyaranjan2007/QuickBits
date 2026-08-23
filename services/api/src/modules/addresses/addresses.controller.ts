import { Inject, Controller, Get, Post, Put, Delete, Patch,
  Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IApiResponse } from '@quickbite/types';

@ApiTags('Addresses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('addresses')
export class AddressesController {
  constructor(@Inject(AddressesService) private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  async findAll(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.addressesService.findAllByUser(userId);
    return { success: true, data, message: 'Addresses retrieved' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<IApiResponse> {
    const data = await this.addressesService.findOne(id, userId);
    return { success: true, data, message: 'Address retrieved' };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ): Promise<IApiResponse> {
    const data = await this.addressesService.create(userId, dto);
    return { success: true, data, message: 'Address created' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<IApiResponse> {
    const data = await this.addressesService.update(id, userId, dto);
    return { success: true, data, message: 'Address updated' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<IApiResponse> {
    const data = await this.addressesService.remove(id, userId);
    return { success: true, data, message: data.message };
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<IApiResponse> {
    const data = await this.addressesService.setDefault(id, userId);
    return { success: true, data, message: data.message };
  }
}
