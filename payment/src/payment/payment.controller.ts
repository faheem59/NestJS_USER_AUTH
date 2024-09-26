import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EnrollmentDto } from './dto/enrollment.dto';
import { CurrentUser } from './decorator/current-user.decorator';
import { User } from './types/interface';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/enroll')
  enrollCourse(@Body() enrollData: EnrollmentDto, @CurrentUser() user: User) {
    const userId = user.id;
    return this.paymentService.enrollment(enrollData, userId);
  }

  @Get(':id/getenrollcourse')
  getEnrollCourseByUserId(@Param('id') id: number) {
    return this.paymentService.getenrollmentByUserId(id);
  }
}
