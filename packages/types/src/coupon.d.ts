import { CouponType } from './enums';
export interface ICoupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    minOrderAmount: number;
    maxDiscount: number | null;
    startDate: Date;
    endDate: Date;
    usageLimit: number | null;
    perUserLimit: number;
    currentUsage: number;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateCoupon {
    code: string;
    type: CouponType;
    value: number;
    minOrderAmount: number;
    maxDiscount?: number;
    startDate: Date;
    endDate: Date;
    usageLimit?: number;
    perUserLimit?: number;
}
export interface IUpdateCoupon {
    value?: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    endDate?: Date;
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
}
export interface ICouponUsage {
    id: string;
    couponId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    createdAt: Date;
}
//# sourceMappingURL=coupon.d.ts.map