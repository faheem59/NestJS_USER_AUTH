import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
} from "typeorm";
import { Lecture } from "./lecture.entity";
import { Question } from "./question.entity";
import { Exclude } from "class-transformer";

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 1000 })
  description: string;

  @ManyToOne(() => Lecture, (lecture) => lecture.quizzes, {
    onDelete: "CASCADE",
  })
  lecture: Lecture;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];

  @Column({ default: 0 })
  passingScore: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
