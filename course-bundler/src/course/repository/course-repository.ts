import { Repository } from "typeorm";
import { Course } from "../entities/course.entity";
import { CreateCourseDto } from "../dto/create-course.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RedisClientService } from "src/redis-client/redis-client.service";
import { LectureDto } from "../dto/Lecture-dto";
import { Lecture } from "../entities/lecture.entity";

import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Lecture)
    private readonly lectureRepositroy: Repository<Lecture>,
    private readonly redisClient: RedisClientService,
  ) {}

  async createCourse(courseData: CreateCourseDto): Promise<Course> {
    const courses = await this.courseRepository.create(courseData);
    await this.courseRepository.save(courses);
    return courses;
  }

  async addLectures(
    courseId: number,
    lectureData: LectureDto,
  ): Promise<Lecture> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    const lecture = new Lecture();
    Object.assign(lecture, lectureData);

    lecture.course = course;
    return await this.lectureRepositroy.save(lecture);
  }

  async findAllCourses(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  async findCourseById(id: number): Promise<Course> {
    return await this.courseRepository.findOne({ where: { id: id } });
  }

  async updateCourse(
    id: number,
    updateCourseDto: Partial<CreateCourseDto>,
  ): Promise<Course> {
    await this.courseRepository.update(id, updateCourseDto);
    return this.courseRepository.findOne({ where: { id: id } });
  }

  // async removeCourse(id: number): Promise<void> {
  //     await this.delete(id);
  // }
}
