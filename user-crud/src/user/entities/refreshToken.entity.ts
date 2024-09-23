import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  token: string;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User;
}
