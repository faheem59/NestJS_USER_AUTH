import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { Enrollment } from './entities/enroll-entities';

@Injectable()
export class PaymentService {
  constructor(private readonly repository: PaymentRepository) {}

  async enrollment(
    enrollData: EnrollmentDto,
    userId: number,
  ): Promise<Enrollment> {
    return await this.repository.create(enrollData, userId);
  }
}
