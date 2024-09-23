import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Role as RoleEnum } from "../../enum/role-enum";
import { User } from "./user.entity";

@Entity()
export class RoleEntity {
  @PrimaryGeneratedColumn()
  @JoinColumn()
  id: number;

  @Column({ type: "enum", enum: RoleEnum, unique: true })
  name: RoleEnum;

  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
