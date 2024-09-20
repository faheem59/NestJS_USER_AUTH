

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Lecture } from './lecture.entity';


@Entity()
export class Course {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ length: 200 })
    title: string;

    @Column({ length: 1000 })
    description: string;

    @OneToMany(() => Lecture, (lecture) => lecture.course, { cascade: true })
    lectures: Lecture[];

    @Column('jsonb')
    poster: { public_id: string; url: string };

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    numOfVideos: number;

    @Column()
    category: string;

    @Column()
    createdBy: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
