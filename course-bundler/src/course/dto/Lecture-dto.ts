import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
} from 'class-validator';
export class LectureDto {
  @IsNumber()
  @IsOptional()
  id: number;
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  video: { public_id?: string; url?: string };
}
