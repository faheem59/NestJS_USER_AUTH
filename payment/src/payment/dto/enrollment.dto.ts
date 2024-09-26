import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
