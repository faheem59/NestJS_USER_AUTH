import { IsNotEmpty, IsString, IsObject, IsOptional } from "class-validator";
export class LectureDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsObject()
  video: { public_id?: string; url?: string };
}
