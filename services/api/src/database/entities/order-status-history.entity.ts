import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { OrderStatus } from '@quickbite/types';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

@Entity('order_status_history')
export class OrderStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ type: 'text', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'text', name: 'changed_by' })
  changedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => OrderEntity, (order) => order.statusHistory)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
