import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { PayoutStatus } from '@quickbite/types';
import { DeliveryPartnerEntity } from './delivery-partner.entity';

@Entity('delivery_payouts')
export class DeliveryPayoutEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'delivery_partner_id' })
  deliveryPartnerId: string;

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

  @ManyToOne(() => DeliveryPartnerEntity)
  @JoinColumn({ name: 'delivery_partner_id' })
  deliveryPartner: DeliveryPartnerEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
