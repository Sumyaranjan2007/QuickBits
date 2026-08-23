import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { PaymentMethod, PaymentStatus } from '@quickbite/types';
import { OrderEntity } from './order.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ type: 'real' })
  amount: number;

  @Column({ type: 'text', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'text', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', length: 255, nullable: true, name: 'gateway_payment_id' })
  gatewayPaymentId: string | null;

  @Column({ type: 'text', length: 255, nullable: true, name: 'gateway_order_id' })
  gatewayOrderId: string | null;

  @Column({ type: 'simple-json', nullable: true, name: 'gateway_response' })
  gatewayResponse: Record<string, unknown> | null;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
