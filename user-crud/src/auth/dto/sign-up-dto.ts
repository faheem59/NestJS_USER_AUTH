import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsPhoneNumber("IN")
  readonly phonenumber: string;

  @IsNotEmpty()
  readonly password: string;

  @IsOptional()
  readonly role: string;
}
