import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index } from 'typeorm';
import { ApprovalStatus } from '@quickbite/types';
import { UserEntity } from './user.entity';
import { MenuCategoryEntity } from './menu-category.entity';

@Entity('restaurants')
export class RestaurantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'owner_id' })
  @Index()
  ownerId: string;

  @Column({ type: 'text', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', length: 500, nullable: true, name: 'logo_url' })
  logoUrl: string | null;

  @Column({ type: 'text', length: 500, nullable: true, name: 'cover_image_url' })
  coverImageUrl: string | null;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', length: 20 })
  phone: string;

  @Column({ type: 'real' })
  latitude: number;

  @Column({ type: 'real' })
  longitude: number;

  @Column({ type: 'text', length: 5, name: 'opening_hours' })
  openingHours: string;

  @Column({ type: 'text', length: 5, name: 'closing_hours' })
  closingHours: string;

  @Column({ type: 'simple-array', name: 'cuisine_type' })
  cuisineType: string[];

  @Column({ type: 'real', default: 0, name: 'min_order_amount' })
  minOrderAmount: number;

  @Column({ type: 'real', default: 30, name: 'delivery_fee' })
  deliveryFee: number;

  @Column({ type: 'int', default: 30, name: 'avg_delivery_time' })
  avgDeliveryTime: number;

  @Column({ type: 'real', default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0, name: 'total_ratings' })
  totalRatings: number;

  @Column({
    type: 'text',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
    name: 'approval_status' })
  @Index()
  approvalStatus: ApprovalStatus;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'real', default: 20, name: 'commission_rate' })
  commissionRate: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => MenuCategoryEntity, (category) => category.restaurant)
  menuCategories: MenuCategoryEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
