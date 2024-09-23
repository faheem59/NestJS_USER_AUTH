import { User } from "../user/entities/user.entity";

export function omitFields(user: User): Partial<User> {
  const { ...userWithoutSensitiveInfo } = user;
  return userWithoutSensitiveInfo;
}
