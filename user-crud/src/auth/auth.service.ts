import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/sign-up-dto";
import { SUCCESS_MESSAGES } from "../utils/success-messges";
import { ERROR_MESSAGES } from "../utils/error-messages";
import { LoginDto } from "./dto/login-dto";
import {
  CreateUserResponse,
  LoginUserResponse,
} from "../utils/success-response";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";
import { User } from "../user/entities/user.entity";
import { UserStatus } from "../enum/permission-enum";
import { RefreshToken } from "../user/entities/refreshToken.entity";
import { RefreshTokenDto } from "./dto/refresh-token-dto";
import { ClientService } from "../redisClient/client.service";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { UserService } from "../user/user.service";
import { Common } from "../enum/common-enum";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private cacheService: ClientService,
    private rabbitmqService: RabbitmqService,
  ) {}

  // Signup User

  async createUser(userData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const userResponse = await this.userService.create(userData);
      const user = userResponse.user;
      await this.rabbitmqService.sendMessage(
        Common.USER_CREATED,
        plainToClass(User, user),
      );

      return {
        message: SUCCESS_MESSAGES.USER_CREATED,
        user: plainToClass(User, user),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //SignUp Admin

  async createAdmin(adminData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const adminResponse = await this.userService.createAdmin(adminData);
      const admin = adminResponse.user;

      await this.rabbitmqService.sendMessage(
        Common.ADMIN_CREATED,
        plainToClass(User, admin),
      );

      return {
        message: SUCCESS_MESSAGES.ADMIN_CREATED,
        user: plainToClass(User, admin),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Login
  async validateUser(userData: LoginDto): Promise<LoginUserResponse> {
    const { email, password } = userData;
    try {
      const userResponse = await this.userService.findOneEmail(email);
      const user = userResponse.user;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new BadRequestException(ERROR_MESSAGES.USER_INACTIVE);
      }

      await this.userService.findTokenById(user.id);
      const newToken = await this.generateRefereshtoken(user.id);

      // If a refresh token exists for this user, update it
      await this.userService.saveUpdateToken(user.id, newToken);

      const accessToken = await this.generateAccesstoken(
        user.id,
        user.role.name,
      );
      return {
        message: SUCCESS_MESSAGES.USER_LOGGEDIN,
        user: plainToClass(User, user),
        accessToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  // Generate AccessToken
  async generateAccesstoken(userId: number, role: string): Promise<string> {
    try {
      const accessToken = this.jwtService.sign({ id: userId, role: role });
      await this.cacheService.setValue(Common.ACCESS_TOKEN, accessToken);
      return accessToken;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Generate refreshToken
  async generateRefereshtoken(userId: number): Promise<string> {
    try {
      const refreshToken = this.jwtService.sign(
        { id: userId },
        { expiresIn: "7d" },
      );
      await this.cacheService.setValue(
        Common.REFRESH_TOKEN,
        JSON.stringify(refreshToken),
      );
      return refreshToken;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //ValidateToken
  async validateRefreshToken(refreshToken: string): Promise<RefreshToken> {
    try {
      const tokenRecord = await this.userService.findToken(refreshToken);
      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException(
          ERROR_MESSAGES.INVALID_REFRESH_TOKEN_OR_EXPIRES,
        );
      }
      return tokenRecord;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  //Genereate new AccessToken
  async refreshToken(
    refresTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    try {
      const { refreshToken } = refresTokenDto;

      const tokenRecord = await this.validateRefreshToken(refreshToken);

      const user = tokenRecord.user;
      const accessToken = await this.generateAccesstoken(
        user.id,
        user.role.name,
      );
      await this.cacheService.setValue(
        Common.ACCESS_TOKEN,
        JSON.stringify(user),
      );
      return { accessToken };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
