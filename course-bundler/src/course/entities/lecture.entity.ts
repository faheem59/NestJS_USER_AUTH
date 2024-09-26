import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Lecture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('jsonb')
  video: {
    public_id?: string;
    url?: string;
  };

  @ManyToOne(() => Course, (course) => course.lectures, { onDelete: 'CASCADE' })
  course: Course;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
