import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateCourseDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  @IsOptional()
  poster: { public_id: string; url: string };

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  views?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  numOfVideos?: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  createdBy: object;

  @IsOptional()
  createdAt?: Date;
}
