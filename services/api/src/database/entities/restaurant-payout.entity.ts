import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { PayoutStatus } from '@quickbite/types';
import { RestaurantEntity } from './restaurant.entity';

@Entity('restaurant_payouts')
export class RestaurantPayoutEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'restaurant_id' })
  restaurantId: string;

  @Column({ type: 'real' })
  amount: number;

  @Column({ type: 'datetime', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'datetime', name: 'period_end' })
  periodEnd: Date;

  @Column({ type: 'text', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status: PayoutStatus;

  @Column({ type: 'text', length: 255, nullable: true, name: 'transaction_id' })
  transactionId: string | null;

  @ManyToOne(() => RestaurantEntity)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
