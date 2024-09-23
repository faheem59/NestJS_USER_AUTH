import { User } from "../user/entities/user.entity";

export class CreateUserResponse {
  message: string;
  user: User;
}

export class UpdateUserResponse {
  message: string;
  user?: User;
}

export class DeleteUserResponse {
  message: string;
}

export class FindAllUsersResponse {
  message: string;
  users: User[];
}

export class FindSingleUsersResponse {
  statusCode?: number;
  message: string;
  user?: User;
}

export class LoginUserResponse {
  message: string;
  user?: User;
  accessToken?: string;
}

export class VerifyEmailResponse {
  message: string;
}

export class ResetPasswordResponse {
  message: string;
}
