import { User } from "../entities/user.entity";

export function omitFields(user: User): Partial<User> {
  const { ...userWithoutSensitiveInfo } = user;
  return userWithoutSensitiveInfo;
}
