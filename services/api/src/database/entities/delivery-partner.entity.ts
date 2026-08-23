import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index } from 'typeorm';
import { ApprovalStatus, VehicleType } from '@quickbite/types';
import { UserEntity } from './user.entity';

@Entity('delivery_partners')
export class DeliveryPartnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'text', enum: VehicleType, name: 'vehicle_type' })
  vehicleType: VehicleType;

  @Column({ type: 'text', length: 20, name: 'vehicle_number' })
  vehicleNumber: string;

  @Column({ type: 'text', length: 50, name: 'license_number' })
  licenseNumber: string;

  @Column({ type: 'boolean', default: false, name: 'is_online' })
  isOnline: boolean;

  @Column({
    type: 'text',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
    name: 'approval_status' })
  @Index()
  approvalStatus: ApprovalStatus;

  @Column({ type: 'real', default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0, name: 'total_deliveries' })
  totalDeliveries: number;

  @Column({ type: 'simple-json', nullable: true, name: 'bank_details' })
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  } | null;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
