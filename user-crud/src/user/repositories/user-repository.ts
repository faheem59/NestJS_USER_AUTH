import { MoreThan, Not, Repository } from "typeorm";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { ERROR_MESSAGES } from "../../utils/error-messages";
import { User } from "../entities/user.entity";
import { RoleEntity } from "../entities/role.entity";
import { Role } from "../../enum/role-enum";
import { UserStatus } from "../../enum/permission-enum";
import { Common } from "../../enum/common-enum";
import { MailService } from "../../mail/mail.service";
import {
  ResetPasswordResponse,
  VerifyEmailResponse,
} from "../../utils/success-response";
import { SUCCESS_MESSAGES } from "../../utils/success-messges";

@Injectable()
export class UserRepository {
  private readonly saltRounds = 10;
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly mailService: MailService,
  ) {}

  // create user
  async creatUser(userData: CreateUserDto): Promise<User> {
    const { password, role, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const roleEntity = await this.roleRepository.findOne({
      where: { name: role as Role },
    });
    if (!roleEntity) {
      throw new NotFoundException(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    const existingUser = await this.repository.findOne({
      where: { email: userData.email },
      withDeleted: true,
    });

    if (existingUser) {
      if (existingUser.deletedAt !== null) {
        existingUser.deletedAt = null;
        existingUser.password = hashedPassword;
        existingUser.role = roleEntity;
        existingUser.isVerified = false;
        await this.repository.save(existingUser);
        return existingUser;
      }
      throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const user = this.repository.create({
      ...rest,
      password: hashedPassword,
      role: roleEntity,
      isVerified: false,
    });

    await this.repository.save(user);

    try {
      await this.mailService.sendEmail(user.email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return user;
  }

  // createAdmin
  async createAdmin(adminData: CreateUserDto): Promise<User> {
    const { password, ...rest } = adminData;
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const existingAdmin = await this.repository.findOne({
      where: { email: adminData.email },
      withDeleted: true,
    });

    const roleEntity = await this.roleRepository.findOne({
      where: { name: Role.ADMIN },
    });
    if (!roleEntity) {
      throw new NotFoundException(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    if (existingAdmin) {
      if (existingAdmin.deletedAt !== null) {
        existingAdmin.deletedAt = null;
        existingAdmin.password = hashedPassword;
        existingAdmin.isVerified = false;
        await this.repository.save(existingAdmin);
        return existingAdmin;
      }
      throw new ConflictException(ERROR_MESSAGES.ADMIN_ALREADY_EXISTS);
    }

    const admin = this.repository.create({
      ...rest,
      password: hashedPassword,
      role: roleEntity,
      isVerified: false,
    });
    await this.repository.save(admin);
    try {
      await this.mailService.sendEmail(admin.email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return admin;
  }

  // find user by email
  async findOneByEmail(email: string): Promise<User> {
    return this.repository.findOne({
      where: { email },
      relations: [Common.ROLE],
    });
  }

  // find email by id to restore user
  async findOneByEmailDeleted(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  // get all user
  async findAll(): Promise<User[]> {
    const allUsers = await this.repository.find({
      relations: [Common.ROLE],
    });

    return allUsers.filter(
      (user) => user.role?.name !== (Common.ADMIN as string),
    );
  }

  async findAllInstructor(): Promise<User[]> {
    const allUsers = await this.repository.find({
      relations: [Common.ROLE],
    });

    const instructor = allUsers.filter(
      (user) => user.role?.name === (Common.INSTRUCTOR as string),
    );

    return instructor;
  }

  //find single user
  async findById(id: number): Promise<User> {
    return this.repository.findOneBy({ id });
  }

  // update single user

  async updateOne(id: number, updateUserData: UpdateUserDto): Promise<User> {
    const { email } = updateUserData;

    // Check if the email exists for another user
    const emailExist = await this.repository.findOne({
      where: { email, id: Not(id) },
    });

    if (emailExist) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_EXITS);
    }

    await this.repository.update(id, updateUserData);
    return this.repository.findOne({ where: { id } });
  }

  // delete single user
  async destroy(id: number): Promise<void> {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUNDED);
    }

    await this.repository.softDelete({ id });
  }

  async saveResetToken(email: string, token: string): Promise<void> {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 3600000);
    await this.repository.save(user);
  }

  async findUserByToken(token: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: MoreThan(new Date()),
      },
    });
    return user;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ResetPasswordResponse> {
    const user = await this.findUserByToken(token);
    if (!user) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_REFRESH_TOKEN_OR_EXPIRES,
      );
    }

    user.password = await bcrypt.hash(newPassword, this.saltRounds);
    user.resetToken = null;
    await this.repository.save(user);

    return {
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }
  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id: userId },
      relations: [Common.ROLE],
    });
    return user?.role?.name === Role.ADMIN;
  }

  // Admin can only chnaged the user status

  async updateUserStatus(
    userId: number,
    status: UserStatus,
    adminId: number,
  ): Promise<void> {
    if (!(await this.isAdmin(adminId))) {
      throw new Error(ERROR_MESSAGES.USER_STATUS_NOT_CHANGED);
    }
    await this.repository.update(userId, { status });
  }

  // verify at the time of creating user or admin
  async verfiyMail(email: string): Promise<VerifyEmailResponse> {
    const user = await this.repository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    user.isVerified = true;
    await this.repository.save(user);

    return {
      message: SUCCESS_MESSAGES.EMAIL_VERFIED,
    };
  }
}
