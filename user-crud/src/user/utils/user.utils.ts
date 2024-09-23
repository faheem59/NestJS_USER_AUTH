import { User } from "../entities/user.entity";

export function omitFields(user: User): Partial<User> {
  const { password, deletedAt, ...userWithoutSensitiveInfo } = user;
  return userWithoutSensitiveInfo;
}
