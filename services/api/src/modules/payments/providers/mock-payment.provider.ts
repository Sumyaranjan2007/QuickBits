import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IPaymentProvider,
  PaymentOrderResult,
  PaymentVerificationData,
  PaymentVerificationResult,
  RefundResult,
} from './payment.interface';

/**
 * Mock payment provider for development/testing.
 * Simulates payment gateway behavior without external dependencies.
 */
@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);

  async createOrder(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentOrderResult> {
    const gatewayOrderId = `mock_order_${uuidv4().slice(0, 8)}`;
    this.logger.log(`[MOCK] Created payment order: ${gatewayOrderId} for ₹${amount / 100}`);

    return {
      gatewayOrderId,
      amount,
      currency,
      clientData: {
        mockMode: true,
        message: 'This is a mock payment. Call verify with any paymentId to complete.',
      },
    };
  }

  async verifyPayment(paymentData: PaymentVerificationData): Promise<PaymentVerificationResult> {
    const gatewayPaymentId = paymentData.gatewayPaymentId || `mock_pay_${uuidv4().slice(0, 8)}`;
    this.logger.log(`[MOCK] Verified payment: ${gatewayPaymentId}`);

    return {
      verified: true,
      gatewayPaymentId: gatewayPaymentId as string,
      gatewayResponse: {
        status: 'captured',
        method: 'mock',
        ...paymentData,
      },
    };
  }

  async refund(gatewayPaymentId: string, amount: number): Promise<RefundResult> {
    const refundId = `mock_refund_${uuidv4().slice(0, 8)}`;
    this.logger.log(`[MOCK] Refund initiated: ${refundId} for ₹${amount / 100}`);

    return {
      refundId,
      status: 'processed',
      amount,
    };
  }
}
