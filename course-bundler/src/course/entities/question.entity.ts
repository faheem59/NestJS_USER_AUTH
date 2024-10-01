import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
} from "typeorm";
import { Quiz } from "./quiz.entity";

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column("jsonb")
  options: string[]; // Assuming multiple-choice questions

  @Column()
  correctAnswer: string; // The correct answer

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE" })
  quiz: Quiz;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
