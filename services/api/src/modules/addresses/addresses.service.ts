import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../database/entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async findAllByUser(userId: string) {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    }
    const address = this.addressRepository.create({ ...dto, userId });
    return this.addressRepository.save(address);
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);
    if (dto.isDefault) {
      await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    }
    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
    return { message: 'Address deleted' };
  }

  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    await this.addressRepository.update({ id, userId }, { isDefault: true });
    return { message: 'Default address updated' };
  }
}
