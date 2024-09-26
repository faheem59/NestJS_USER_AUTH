import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment-entities';
import { Enrollment } from './entities/enroll-entities';
import { ClientService } from 'src/redisClient/client.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentService } from './payment.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Enrollment])],
  providers: [
    ClientService,
    PaymentRepository,
    PaymentService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentRepository],
})
export class PaymentModule {}
