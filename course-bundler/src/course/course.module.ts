import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { RedisClientService } from 'src/redis-client/redis-client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseRepository } from './repository/course-repository';
import { Lecture } from './entities/lecture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lecture])],
  controllers: [CourseController],
  providers: [CourseRepository, CourseService, RedisClientService],
  exports: [TypeOrmModule]
})
export class CourseModule { }
