import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "src/user/repositories/user-repository";
import { CreateUserDto } from "./dto/sign-up-dto";
import { SUCCESS_MESSAGES } from "src/user/utils/success-messges-constant";
import { ERROR_MESSAGES } from "src/user/utils/error-messages-constant";
import { LoginDto } from "./dto/login-dto";
import {
  CreateUserResponse,
  LoginUserResponse,
} from "src/user/utils/success-response";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";
import { User } from "src/user/entities/user.entity";
import { UserStatus } from "../user/enum/permission-enum";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshToken } from "src/user/entities/refreshToken.entity";
import { Repository } from "typeorm";
import { RefreshTokenDto } from "./dto/refresh-token-dto";
import { ClientService } from "src/redisClient/client.service";
import { RabbitmqService } from "src/rabbitmq/rabbitmq.service";

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private cacheService: ClientService,
    private rabbitmqService: RabbitmqService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // to create user
  async create(userData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const user = await this.userRepository.creatUser(userData);
      const refreshToken = await this.generateRefereshtoken(user.id);

      // Save the refresh token in the database
      await this.saveRefreshToken(user.id, refreshToken);
      await this.rabbitmqService.sendMessage(
        "user_created",
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

  // to create admin
  async createAdmin(adminData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const admin = await this.userRepository.createAdmin(adminData);
      const refreshToken = await this.generateRefereshtoken(admin.id);

      // Save the refresh token in the database
      await this.saveRefreshToken(admin.id, refreshToken);
      await this.rabbitmqService.sendMessage(
        "user created successfully",
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

  // login user to authenticate the access
  async validateUser(userData: LoginDto): Promise<LoginUserResponse> {
    const { email, password } = userData;
    try {
      const user = await this.userRepository.findOneByEmail(email);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new BadRequestException(ERROR_MESSAGES.USER_INACTIVE);
      }

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
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  // generate access token using jwt
  async generateAccesstoken(userId: number, role: string): Promise<string> {
    try {
      const accessToken = this.jwtService.sign({ id: userId, role: role });
      await this.cacheService.setValue("access_token", accessToken);
      return accessToken;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // generate refresh token using jwt

  async generateRefereshtoken(userId: number): Promise<string> {
    try {
      const refreshToken = this.jwtService.sign(
        { id: userId },
        { expiresIn: "7d" },
      );
      await this.cacheService.setValue(
        `refresh_token`,
        JSON.stringify(refreshToken),
      );
      return refreshToken;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // save the refreshtoken to the database so that when accesstoken expires then give permssion through refreshtoken
  async saveRefreshToken(userId: number, token: string): Promise<void> {
    try {
      const refreshToken = this.refreshTokenRepository.create({
        token,
        user: { id: userId } as User,
        expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      });

      await this.refreshTokenRepository.save(refreshToken);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // validate the refreshtoken from the database
  async validateRefreshToken(refreshToken: string): Promise<RefreshToken> {
    try {
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ["user", "user.role"],
      });
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

  // if refreshtoken exist then give the new access token to authenticate the users.

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
      await this.cacheService.setValue(`access_token`, JSON.stringify(user));
      return { accessToken };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
