import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsPhoneNumber()
  readonly phonenumber: string;
}
