import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { PaymentStatus } from '@quickbite/types';
import { PaymentEntity } from './payment.entity';
import { OrderEntity } from './order.entity';

@Entity('refunds')
export class RefundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'payment_id' })
  paymentId: string;

  @Column({ type: 'text', name: 'order_id' })
  orderId: string;

  @Column({ type: 'real' })
  amount: number;

  @Column({ type: 'text', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'text', length: 255, nullable: true, name: 'gateway_refund_id' })
  gatewayRefundId: string | null;

  @ManyToOne(() => PaymentEntity)
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
