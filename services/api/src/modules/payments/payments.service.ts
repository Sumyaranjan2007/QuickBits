import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { RefundEntity } from '../../database/entities/refund.entity';
import { PaymentStatus, PaymentMethod } from '@quickbite/types';
import { IPaymentProvider } from './providers/payment.interface';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { RazorpayProvider } from './providers/razorpay.provider';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paymentProvider: IPaymentProvider;

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(RefundEntity)
    private readonly refundRepo: Repository<RefundEntity>,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(MockPaymentProvider)
    private readonly mockProvider: MockPaymentProvider,
    @Inject(RazorpayProvider)
    private readonly razorpayProvider: RazorpayProvider,
  ) {
    // Select provider based on configuration
    const useMock = this.configService.get('mock.payment');
    this.paymentProvider = useMock ? this.mockProvider : this.razorpayProvider;
    this.logger.log(`Payment provider: ${useMock ? 'Mock' : 'Razorpay'}`);
  }

  /**
   * Create a payment record and initiate gateway order (for online payments).
   */
  async createPayment(orderId: string, amount: number, method: PaymentMethod) {
    const payment = this.paymentRepo.create({
      orderId,
      amount,
      paymentMethod: method,
      status: PaymentStatus.PENDING,
    });

    if (method === PaymentMethod.CASH_ON_DELIVERY) {
      // COD doesn't need gateway — mark as success immediately
      payment.status = PaymentStatus.SUCCESS;
      return this.paymentRepo.save(payment);
    }

    // Online payment — create gateway order
    const gatewayResult = await this.paymentProvider.createOrder(
      Math.round(amount * 100), // Convert to paise
      'INR',
      { orderId },
    );

    payment.gatewayOrderId = gatewayResult.gatewayOrderId;
    const saved = await this.paymentRepo.save(payment);

    return {
      payment: saved,
      gatewayData: gatewayResult.clientData,
    };
  }

  /**
   * Verify payment from gateway callback.
   * This must be called server-side — never trust client-side payment confirmation.
   */
  async verifyPayment(paymentId: string, verificationData: Record<string, unknown>) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    const result = await this.paymentProvider.verifyPayment({
      gatewayOrderId: payment.gatewayOrderId || '',
      gatewayPaymentId: verificationData.gatewayPaymentId as string || '',
      signature: verificationData.signature as string || '',
    });

    payment.gatewayPaymentId = result.gatewayPaymentId;
    payment.gatewayResponse = result.gatewayResponse;
    payment.status = result.verified ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    return this.paymentRepo.save(payment);
  }

  /**
   * Process a refund.
   */
  async processRefund(orderId: string, amount: number, reason: string) {
    const payment = await this.paymentRepo.findOne({
      where: { orderId, status: PaymentStatus.SUCCESS },
    });
    if (!payment) throw new NotFoundException('No successful payment found for this order');

    if (payment.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      // COD refund is handled offline
      const refund = this.refundRepo.create({
        paymentId: payment.id,
        orderId,
        amount,
        reason,
        status: PaymentStatus.PENDING,
        gatewayRefundId: null,
      });
      return this.refundRepo.save(refund);
    }

    // Online refund via gateway
    const result = await this.paymentProvider.refund(
      payment.gatewayPaymentId || '',
      Math.round(amount * 100),
    );

    const refund = this.refundRepo.create({
      paymentId: payment.id,
      orderId,
      amount,
      reason,
      status: PaymentStatus.PENDING,
      gatewayRefundId: result.refundId,
    });

    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepo.save(payment);

    return this.refundRepo.save(refund);
  }

  async getPaymentByOrderId(orderId: string) {
    return this.paymentRepo.findOne({ where: { orderId } });
  }
}
