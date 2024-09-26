import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EnrollmentDto } from '../dto/enrollment.dto';
import { ClientService } from 'src/redisClient/client.service';
import { Enrollment } from '../entities/enroll-entities';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Enrollment)
    private readonly enrollmentReposity: Repository<Enrollment>,
    private readonly redisClient: ClientService,
  ) {}

  async create(enrollData: EnrollmentDto, userId: number): Promise<Enrollment> {
    const course = await this.redisClient.getValue('course');
    const enroll = this.enrollmentReposity.create({
      ...enrollData,
      user: { id: userId },
      course: { id: course },
    });
    return await this.enrollmentReposity.save(enroll);
  }
}
