import { Inject, Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IApiResponse } from '@quickbite/types';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly paymentsService: PaymentsService) {}

  @Post(':paymentId/verify')
  @ApiOperation({ summary: 'Verify payment from gateway callback' })
  async verifyPayment(
    @Param('paymentId') paymentId: string,
    @Body() verificationData: Record<string, unknown>,
  ): Promise<IApiResponse> {
    const data = await this.paymentsService.verifyPayment(paymentId, verificationData);
    return { success: true, data, message: 'Payment verified' };
  }
}
