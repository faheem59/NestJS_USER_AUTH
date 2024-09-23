import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserRepository } from "./repositories/user-repository";
import { RoleEntity } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { PermissionRepository } from "./repositories/permssion-repository";
import { RefreshToken } from "./entities/refreshToken.entity";
import { ClientService } from "../redisClient/client.service";
import { MailService } from "../mail/mail.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleEntity, Permission, RefreshToken]),
  ],
  providers: [
    UserRepository,
    PermissionRepository,
    UserService,
    ClientService,
    MailService,
  ],
  controllers: [UserController],
  exports: [UserRepository, PermissionRepository, TypeOrmModule],
})
export class UserModule {}
