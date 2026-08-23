import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { DeliveryPartnerEntity } from './delivery-partner.entity';

@Entity('delivery_locations')
export class DeliveryLocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'delivery_partner_id' })
  @Index()
  deliveryPartnerId: string;

  @Column({ type: 'real' })
  latitude: number;

  @Column({ type: 'real' })
  longitude: number;

  @Column({ type: 'real', nullable: true })
  heading: number | null;

  @Column({ type: 'real', nullable: true })
  speed: number | null;

  @ManyToOne(() => DeliveryPartnerEntity)
  @JoinColumn({ name: 'delivery_partner_id' })
  deliveryPartner: DeliveryPartnerEntity;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
