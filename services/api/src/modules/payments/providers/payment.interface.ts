/**
 * Payment provider interface.
 * All payment providers (mock, Razorpay, etc.) must implement this contract.
 * This allows swapping providers without changing business logic.
 */
export interface IPaymentProvider {
  /** Create a payment order on the gateway side */
  createOrder(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentOrderResult>;

  /** Verify a payment callback/webhook from the gateway */
  verifyPayment(paymentData: PaymentVerificationData): Promise<PaymentVerificationResult>;

  /** Initiate a refund */
  refund(gatewayPaymentId: string, amount: number): Promise<RefundResult>;
}

export interface PaymentOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  /** Any additional data the client needs to complete payment (e.g., Razorpay key) */
  clientData?: Record<string, unknown>;
}

export interface PaymentVerificationData {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature?: string;
  [key: string]: unknown;
}

export interface PaymentVerificationResult {
  verified: boolean;
  gatewayPaymentId: string;
  gatewayResponse: Record<string, unknown>;
}

export interface RefundResult {
  refundId: string;
  status: string;
  amount: number;
}
