import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { Enrollment } from './entities/enroll-entities';
import { Payment } from './entities/payment-entities';

@Injectable()
export class PaymentService {
  constructor(private readonly repository: PaymentRepository) {}

  async enrollment(
    enrollData: EnrollmentDto,
    userId: number,
  ): Promise<Enrollment | Payment> {
    return await this.repository.create(enrollData, userId);
  }

  async getenrollmentByUserId(userId: number): Promise<Enrollment | Payment> {
    return this.repository.getEonrollmentByUserId(userId);
  }
}
