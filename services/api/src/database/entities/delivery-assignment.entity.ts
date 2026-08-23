import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { DeliveryAssignmentStatus } from '@quickbite/types';
import { OrderEntity } from './order.entity';
import { DeliveryPartnerEntity } from './delivery-partner.entity';

@Entity('delivery_assignments')
export class DeliveryAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ type: 'text', name: 'delivery_partner_id' })
  @Index()
  deliveryPartnerId: string;

  @Column({
    type: 'text',
    enum: DeliveryAssignmentStatus,
    default: DeliveryAssignmentStatus.PENDING })
  status: DeliveryAssignmentStatus;

  @Column({ type: 'datetime', nullable: true, name: 'assigned_at' })
  assignedAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'picked_up_at' })
  pickedUpAt: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'delivered_at' })
  deliveredAt: Date | null;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => DeliveryPartnerEntity)
  @JoinColumn({ name: 'delivery_partner_id' })
  deliveryPartner: DeliveryPartnerEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
