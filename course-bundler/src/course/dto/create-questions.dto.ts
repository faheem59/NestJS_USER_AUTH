import { IsString, IsArray, IsNotEmpty } from "class-validator";

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsNotEmpty()
  options: string[]; // Array of answer options

  @IsString()
  @IsNotEmpty()
  correctAnswer: string; // The correct answer
}
