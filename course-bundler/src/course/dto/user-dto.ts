import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  IsOptional,
  Matches,
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
  @MinLength(8)
  @Matches("/^(?=.*[0-9])/")
  readonly password: string;

  @IsOptional()
  readonly role: string;
}
