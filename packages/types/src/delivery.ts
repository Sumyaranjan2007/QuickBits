import { ApprovalStatus, DeliveryAssignmentStatus, DeliveryPartnerStatus, VehicleType } from './enums';

export interface IDeliveryPartner {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  isOnline: boolean;
  approvalStatus: ApprovalStatus;
  rating: number;
  totalDeliveries: number;
  bankDetails: IBankDetails | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface ICreateDeliveryPartner {
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  bankDetails?: IBankDetails;
}

export interface IDeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  status: DeliveryAssignmentStatus;
  assignedAt: Date;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

export interface IDeliveryLocation {
  id: string;
  deliveryPartnerId: string;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  updatedAt: Date;
}

export interface IUpdateDeliveryLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}
