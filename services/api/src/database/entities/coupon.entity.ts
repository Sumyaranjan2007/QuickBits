import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { CouponType } from '@quickbite/types';
import { UserEntity } from './user.entity';

@Entity('coupons')
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 20, unique: true })
  @Index()
  code: string;

  @Column({ type: 'text', enum: CouponType })
  type: CouponType;

  @Column({ type: 'real' })
  value: number;

  @Column({ type: 'real', default: 0, name: 'min_order_amount' })
  minOrderAmount: number;

  @Column({ type: 'real', nullable: true, name: 'max_discount' })
  maxDiscount: number | null;

  @Column({ type: 'datetime', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'datetime', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'int', nullable: true, name: 'usage_limit' })
  usageLimit: number | null;

  @Column({ type: 'int', default: 1, name: 'per_user_limit' })
  perUserLimit: number;

  @Column({ type: 'int', default: 0, name: 'current_usage' })
  currentUsage: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
