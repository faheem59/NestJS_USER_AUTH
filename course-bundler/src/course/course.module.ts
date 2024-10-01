import { Module } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { RedisClientService } from "src/redis-client/redis-client.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "./entities/course.entity";
import { CourseRepository } from "./repository/course-repository";
import { Lecture } from "./entities/lecture.entity";
import { CloudinaryService } from "src/config/cloudinary.service";
import { AuthGuard } from "./guard/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./guard/role.gaurd";
import { JwtService } from "@nestjs/jwt";
import { RabbitmqModule } from "src/rabbitmq/rabbitmq.module";
import { Quiz } from "./entities/quiz.entity";
import { Question } from "./entities/question.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lecture, Quiz, Question]),
    RabbitmqModule,
  ],
  controllers: [CourseController],
  providers: [
    CourseRepository,
    CourseService,
    RedisClientService,
    CloudinaryService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [TypeOrmModule],
})
export class CourseModule {}
