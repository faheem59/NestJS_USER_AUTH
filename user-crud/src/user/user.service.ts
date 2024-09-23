import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserRepository } from "./repositories/user-repository";
import { User } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ERROR_MESSAGES } from "./utils/error-messages-constant";
import { SUCCESS_MESSAGES } from "./utils/success-messges-constant";
import {
  DeleteUserResponse,
  FindAllUsersResponse,
  FindSingleUsersResponse,
  UpdateUserResponse,
  VerifyEmailResponse,
} from "./utils/success-response";
import { plainToClass } from "class-transformer";
import { UserStatus } from "./enum/permission-enum";
import { PermissionRepository } from "./repositories/permssion-repository";
import * as crypto from "crypto";
import { ClientService } from "../redisClient/client.service";

@Injectable()
export class UserService {
  private readonly saltRounds = 10;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly reddisClient: ClientService,
  ) {}

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

  async generatePasswordResetToken(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    await this.userRepository.saveResetToken(email, token);
    return token;
  }
  async resetPassword(token: string, newPassword: string): Promise<string> {
    return await this.userRepository.resetPassword(token, newPassword);
  }

  async addPermissionsToUser(
    userId: number,
    permissionNames: string[],
  ): Promise<User> {
    return this.permissionRepository.addPermissionsToUser(
      userId,
      permissionNames,
    );
  }

  async removePermissionsFromUser(
    userId: number,
    permissionNames: string[],
  ): Promise<User> {
    return this.permissionRepository.removePermissionsFromUser(
      userId,
      permissionNames,
    );
  }

  async getUserPermissions(userId: number): Promise<any> {
    return this.permissionRepository.getUserPermissions(userId);
  }

  async verfiyMail(email: string): Promise<VerifyEmailResponse> {
    return await this.userRepository.verfiyMail(email);
  }
}
