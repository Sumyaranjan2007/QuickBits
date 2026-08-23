import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  PaymentOrderResult,
  PaymentVerificationData,
  PaymentVerificationResult,
  RefundResult,
} from './payment.interface';

/**
 * Razorpay payment provider.
 * Replace the mock calls with actual Razorpay SDK calls when real credentials are available.
 * See: https://razorpay.com/docs/api/
 */
@Injectable()
export class RazorpayProvider implements IPaymentProvider {
  private readonly logger = new Logger(RazorpayProvider.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    // In production, initialize Razorpay SDK:
    // const Razorpay = require('razorpay');
    // this.razorpay = new Razorpay({
    //   key_id: this.configService.get('razorpay.keyId'),
    //   key_secret: this.configService.get('razorpay.keySecret'),
    // });
    this.logger.log('Razorpay provider initialized (stub — implement with real SDK)');
  }

  async createOrder(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentOrderResult> {
    // TODO: Replace with actual Razorpay API call
    // const order = await this.razorpay.orders.create({
    //   amount, currency, receipt: metadata.orderId,
    //   notes: metadata,
    // });
    throw new Error('Razorpay provider not yet implemented. Set USE_MOCK_PAYMENT=true for development.');
  }

  async verifyPayment(paymentData: PaymentVerificationData): Promise<PaymentVerificationResult> {
    // TODO: Verify signature using razorpay webhook secret
    // const crypto = require('crypto');
    // const generated = crypto.createHmac('sha256', this.configService.get('razorpay.webhookSecret'))
    //   .update(paymentData.gatewayOrderId + '|' + paymentData.gatewayPaymentId)
    //   .digest('hex');
    // const verified = generated === paymentData.signature;
    throw new Error('Razorpay provider not yet implemented. Set USE_MOCK_PAYMENT=true for development.');
  }

  async refund(gatewayPaymentId: string, amount: number): Promise<RefundResult> {
    // TODO: Replace with actual Razorpay refund API call
    // const refund = await this.razorpay.payments.refund(gatewayPaymentId, { amount });
    throw new Error('Razorpay provider not yet implemented. Set USE_MOCK_PAYMENT=true for development.');
  }
}
