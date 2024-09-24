import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserRepository } from "./repositories/user-repository";
import { User } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ERROR_MESSAGES } from "../utils/error-messages";
import { SUCCESS_MESSAGES } from "../utils/success-messges";
import {
  CreateUserResponse,
  DeleteUserResponse,
  FindAllUsersResponse,
  FindSingleUsersResponse,
  LoginUserResponse,
  ResetPasswordResponse,
  UpdateUserResponse,
  VerifyEmailResponse,
} from "../utils/success-response";
import { plainToClass } from "class-transformer";
import { UserStatus } from "../enum/permission-enum";
import { PermissionRepository } from "./repositories/permssion-repository";
import * as crypto from "crypto";
import { ClientService } from "../redisClient/client.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { RefreshTokenRepository } from "./repositories/refreshToken-repository";
import { RefreshToken } from "./entities/refreshToken.entity";

@Injectable()
export class UserService {
  private readonly saltRounds = 10;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly reddisClient: ClientService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  // create user
  async create(userData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const user = await this.userRepository.creatUser(userData);
      return {
        message: SUCCESS_MESSAGES.USER_CREATED,
        user: plainToClass(User, user),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //create admin
  async createAdmin(adminData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const admin = this.userRepository.createAdmin(adminData);
      return {
        message: SUCCESS_MESSAGES.USER_CREATED,
        user: plainToClass(User, admin),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneEmail(email: string): Promise<LoginUserResponse> {
    try {
      const user = await this.userRepository.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return {
        message: SUCCESS_MESSAGES.USER_LOGGEDIN,
        user: user,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Find all users
  async findAll(): Promise<FindAllUsersResponse> {
    try {
      const users = await this.userRepository.findAll();
      const usersWithoutSensitiveInfo = users.map((user) =>
        plainToClass(User, user),
      );
      return {
        message: SUCCESS_MESSAGES.USER_RETRIEVED,
        users: usersWithoutSensitiveInfo,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findInstructor(): Promise<FindAllUsersResponse> {
    try {
      const users = await this.userRepository.findAllInstructor();
      const usersWithoutSensitiveInfo = users.map((user) =>
        plainToClass(User, user),
      );
      await this.reddisClient.setValue("instructor", usersWithoutSensitiveInfo);
      return {
        message: SUCCESS_MESSAGES.USER_RETRIEVED,
        users: usersWithoutSensitiveInfo,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Find single user
  async findById(id: number): Promise<FindSingleUsersResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException(
          ERROR_MESSAGES.USER_NOT_FOUND.replace("{id}", id.toString()),
        );
      }

      return {
        message: SUCCESS_MESSAGES.USER_RETRIEVED,
        user: plainToClass(User, user),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // Update user
  async update(
    id: number,
    updateUserData: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    try {
      const updatedUser = await this.userRepository.updateOne(
        id,
        updateUserData,
      );

      if (!updatedUser) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return {
        message: SUCCESS_MESSAGES.USER_UPDATED,
        user: plainToClass(User, updatedUser),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // Admin can change the user status to acitve or inactive
  async changeUserStatus(
    userId: number,
    status: UserStatus,
    adminId: number,
  ): Promise<void> {
    await this.userRepository.updateUserStatus(userId, status, adminId);
  }

  // Remove user
  async remove(id: number): Promise<DeleteUserResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException(
          ERROR_MESSAGES.USER_NOT_FOUND.replace("{id}", id.toString()),
        );
      }

      await this.userRepository.destroy(id);
      return { message: SUCCESS_MESSAGES.USER_REMOVED };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // to Send a resettoken to user to reset the password
  async generatePasswordResetToken(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    await this.userRepository.saveResetToken(email, token);
    return token;
  }

  // User can reset the password

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ResetPasswordResponse> {
    return await this.userRepository.resetPassword(token, newPassword);
  }

  // Admin can add permission to user
  async addPermissionsToUser(
    userId: number,
    permissionNames: string[],
  ): Promise<User> {
    return this.permissionRepository.addPermissionsToUser(
      userId,
      permissionNames,
    );
  }

  // Admin can remove the permission from user

  async removePermissionsFromUser(
    userId: number,
    permissionNames: string[],
  ): Promise<User> {
    return this.permissionRepository.removePermissionsFromUser(
      userId,
      permissionNames,
    );
  }

  // Admin only see What permission user can have.
  async getUserPermissions(userId: number): Promise<any> {
    return this.permissionRepository.getUserPermissions(userId);
  }

  // User verify mail when signup
  async verfiyMail(email: string): Promise<VerifyEmailResponse> {
    return await this.userRepository.verfiyMail(email);
  }

  // refreshToken Generate and upate if exist
  async saveUpdateToken(userId: number, token: string): Promise<void> {
    await this.refreshTokenRepository.saveUpdateToken(userId, token);
  }

  // find token from the table

  async findToken(token: string): Promise<RefreshToken> {
    return await this.refreshTokenRepository.findToken(token);
  }

  // find token for checking if exis or not using userId
  async findTokenById(userId: number): Promise<RefreshToken | null> {
    return await this.refreshTokenRepository.findTokenById(userId);
  }
}
