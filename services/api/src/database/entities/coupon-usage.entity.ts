import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { CouponEntity } from './coupon.entity';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';

@Entity('coupon_usage')
export class CouponUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'coupon_id' })
  couponId: string;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @Column({ type: 'text', name: 'order_id' })
  orderId: string;

  @Column({ type: 'real', name: 'discount_amount' })
  discountAmount: number;

  @ManyToOne(() => CouponEntity)
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
