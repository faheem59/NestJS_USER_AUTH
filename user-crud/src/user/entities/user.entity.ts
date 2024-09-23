import { Exclude } from "class-transformer";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { RoleEntity } from "./role.entity";
import { UserStatus } from "../../enum/permission-enum";
import { Permission } from "./permission.entity";
import { RefreshToken } from "./refreshToken.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 30, nullable: false })
  name: string;

  @Column({ unique: true, type: "varchar", length: 30 })
  email: string;

  @Column({ unique: true, type: "varchar" })
  phonenumber: string;

  @Exclude()
  @Column({ type: "varchar", length: 255 })
  password: string;

  @ManyToOne(() => RoleEntity, (role) => role.user, { eager: true })
  role: RoleEntity;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Exclude()
  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions: Permission[];

  @Exclude()
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Exclude()
  @Column({ default: false })
  isVerified: boolean;

  @Exclude()
  @Column({ nullable: true })
  resetToken: string;

  @Exclude()
  @Column({ type: "timestamp", nullable: true })
  resetTokenExpiration: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
