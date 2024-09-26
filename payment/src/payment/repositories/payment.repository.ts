import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EnrollmentDto } from '../dto/enrollment.dto';
import { ClientService } from 'src/redisClient/client.service';
import { Enrollment } from '../entities/enroll-entities';
import { Status } from 'src/enum/common.enum';
import { ERROR_MESSAGES } from 'src/utils/error.message';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly redisClient: ClientService,
  ) {}

  async create(
    enrollData: EnrollmentDto,
    userId: number,
  ): Promise<Enrollment | Payment> {
    const courseId = await this.redisClient.getValue('course');

    // Create a new payment record
    const payment = this.paymentRepository.create({
      amount: enrollData.amount,
      paymentMethod: enrollData.paymentMethod,
      status: Status.PENDING,
      createdAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    const paymentSuccess = await this.processPayment(savedPayment);

    if (paymentSuccess) {
      const enrollment = this.enrollmentRepository.create({
        userId,
        courseId,
        payment: savedPayment,
        enrolledAt: new Date(),
        status: 'active',
      });

      return await this.enrollmentRepository.save(enrollment);
    } else {
      throw new InternalServerErrorException(ERROR_MESSAGES.PAYMENT_FAILED);
    }
  }

  private async processPayment(payment: Payment): Promise<boolean> {
    payment.status = Status.COMPLETED;
    await this.paymentRepository.save(payment);
    return true;
  }

  async getEonrollmentByUserId(userId: number): Promise<any> {
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
    });
    const courseDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseData = await this.redisClient.getValue('course');

        if (!courseData) {
          throw new NotFoundException(
            `Course not found for ID: ${enrollment.courseId}`,
          );
        }

        const course = JSON.parse(courseData);

        return {
          id: enrollment.id,
          courseId: enrollment.courseId,
          enrolledAt: enrollment.enrolledAt,
          courseName: course.name,
          status: enrollment.status,
        };
      }),
    );

    return courseDetails;
  }
}
