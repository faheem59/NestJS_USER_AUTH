import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  HttpException,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  DeleteUserResponse,
  FindAllUsersResponse,
  UpdateUserResponse,
} from "../utils/success-response";
import { Public, Roles } from "src/auth/decorator/public.decorator";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { User } from "./interface/interface";
import { ERROR_MESSAGES } from "../utils/error-messages";
import { Role } from "../enum/role-enum";
import { UserStatus } from "../enum/permission-enum";
import { AddPermissionsDto, RemovePermissionsDto } from "./dto/permission-dto";
import { MailService } from "../mail/mail.service";

@Controller({
  version: "1",
  path: "users",
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    const token = await this.userService.generatePasswordResetToken(email);
    await this.mailService.sendPasswordResetEmail(email, token);
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    return await this.userService.resetPassword(token, newPassword);
  }

  @Get("verify")
  async verifyEmail(@Query("email") email: string) {
    return await this.userService.verfiyMail(email);
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<FindAllUsersResponse> {
    return this.userService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get("instructor")
  async findAllInstructor(): Promise<FindAllUsersResponse> {
    return this.userService.findInstructor();
  }

  @Get(":id")
  async findById(@Param("id") id: number) {
    return this.userService.findById(id);
  }

  @Patch(":id")
  async update(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ): Promise<UpdateUserResponse> {
    if (user.id !== id) {
      throw new HttpException(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userService.update(user.id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/status")
  async updateStatus(
    @Param("id") userId: number,
    @Body("status") status: UserStatus,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    const adminId = currentUser.id;
    await this.userService.changeUserStatus(userId, status, adminId);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/permissions/add")
  async addPermissions(
    @Param("id") userId: number,
    @Body() addPermissionsData: AddPermissionsDto,
  ) {
    return this.userService.addPermissionsToUser(
      userId,
      addPermissionsData.name,
    );
  }

  @Roles(Role.ADMIN)
  @Patch(":id/permissions/remove")
  async removePermissions(
    @Param("id") userId: number,
    @Body() removePermissionsData: RemovePermissionsDto,
  ) {
    return this.userService.removePermissionsFromUser(
      userId,
      removePermissionsData.name,
    );
  }

  @Roles(Role.ADMIN)
  @Get(":id/permissions")
  async getPermissions(@Param("id") userId: number) {
    return this.userService.getUserPermissions(userId);
  }

  @Delete(":id")
  async remove(
    @Param("id") id: number,
    @CurrentUser() user: User,
  ): Promise<DeleteUserResponse> {
    if (user.id !== id) {
      throw new HttpException(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userService.remove(user.id);
  }
}
