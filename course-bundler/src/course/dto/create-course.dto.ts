import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject, IsArray } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsObject()
    @IsNotEmpty()
    poster: { public_id: string; url: string };

    @IsNumber()
    @IsOptional()
    views?: number;

    @IsNumber()
    @IsOptional()
    numOfVideos?: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsNotEmpty()
    createdBy: string;

    @IsOptional()
    createdAt?: Date;
}
