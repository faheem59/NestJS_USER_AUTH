import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Lecture } from './lecture.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 1000 })
  description: string;

  @OneToMany(() => Lecture, (lecture) => lecture.course, { cascade: true })
  lectures: Lecture[];

  @Column('jsonb', { nullable: true })
  poster: { public_id?: string; url?: string } | null;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  numOfVideos: number;

  @Column({ nullable: true })
  category: string;

  @Column('jsonb', { nullable: true })
  createdBy: {
    id?: number;
    name?: string;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
