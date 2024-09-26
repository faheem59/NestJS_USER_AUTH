import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from 'src/enum/common.enum';

export class EnrollmentDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  user: number;

  @IsNumber()
  @IsNotEmpty()
  course: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  paymentMethod: PaymentMethod;
}
