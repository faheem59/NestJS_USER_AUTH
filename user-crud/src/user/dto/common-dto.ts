import { IsArray, IsString, ArrayNotEmpty } from "class-validator";

export class RemovePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  name: string[];
}

export class AddPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  name: string[];
}
