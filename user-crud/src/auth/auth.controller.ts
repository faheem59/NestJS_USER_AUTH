import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login-dto";
import { CreateUserDto } from "./dto/sign-up-dto";
import {
  CreateUserResponse,
  LoginUserResponse,
} from "../utils/success-response";
import { Public } from "./decorator/public.decorator";
import { RefreshTokenDto } from "./dto/refresh-token-dto";

@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("/signup")
  signUp(@Body() signUpDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.authService.createUser(signUpDto);
  }

  @Public()
  @Post("/admin")
  signUpAdmin(@Body() signUpDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.authService.createAdmin(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post("/login")
  login(@Body() loginDto: LoginDto): Promise<LoginUserResponse | string> {
    return this.authService.validateUser(loginDto);
  }

  @Public()
  @Post("/refresh-token")
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
