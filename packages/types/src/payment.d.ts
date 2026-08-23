import { PaymentMethod, PaymentStatus } from './enums';
export interface IPayment {
    id: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    gatewayPaymentId: string | null;
    gatewayOrderId: string | null;
    gatewayResponse: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreatePayment {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
}
export interface IRefund {
    id: string;
    paymentId: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    reason: string | null;
    gatewayRefundId: string | null;
    createdAt: Date;
}
export interface IPaymentVerification {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
}
//# sourceMappingURL=payment.d.ts.map