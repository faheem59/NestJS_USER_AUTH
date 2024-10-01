import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { Course } from "./course.entity";
import { Exclude } from "class-transformer";
import { Quiz } from "./quiz.entity";

@Entity()
export class Lecture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("jsonb")
  video: {
    public_id?: string;
    url?: string;
  };

  @ManyToOne(() => Course, (course) => course.lectures, { onDelete: "CASCADE" })
  course: Course;

  @OneToMany(() => Quiz, (quiz) => quiz.lecture, { cascade: true })
  quizzes: Quiz[];

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
