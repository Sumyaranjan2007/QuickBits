import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { RazorpayProvider } from './providers/razorpay.provider';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { RefundEntity } from '../../database/entities/refund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, RefundEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentProvider, RazorpayProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
