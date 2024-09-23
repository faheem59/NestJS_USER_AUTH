import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Permission } from "../entities/permission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { In } from "typeorm";
import { ERROR_MESSAGES } from "../../utils/error-messages";
import { Common } from "../../enum/common-enum";
import { ClientService } from "../../redisClient/client.service";

@Injectable()
export class PermissionRepository {
  constructor(
    private cacheService: ClientService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // Add permissions to a user
  async addPermissionsToUser(
    userId: number,
    permissionNames: string[],
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [Common.PERMISSION],
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const permissions = await this.permissionRepository.find({
      where: { name: In(permissionNames) },
    });

    if (permissions.length !== permissionNames.length) {
      throw new ConflictException(ERROR_MESSAGES.INVALID_PERMISSION);
    }

    user.permissions = [...user.permissions, ...permissions];
    await this.userRepository.save(user);
    await this.cacheService.delKey(Common.ACCESS_TOKEN);

    return user;
  }

  // Remove permissions from a user
  async removePermissionsFromUser(
    userId: number,
    permissionNames: string[],
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [Common.PERMISSION],
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    user.permissions = user.permissions.filter(
      (permission) => !permissionNames.includes(permission.name),
    );

    await this.userRepository.save(user);
    return user;
  }

  // Get a user's permissions
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [Common.PERMISSION],
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user.permissions;
  }
}
