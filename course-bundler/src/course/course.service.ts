import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { EventPattern, Payload } from "@nestjs/microservices";
import { CreateUserDto } from "./dto/user-dto";
import { CourseRepository } from "./repository/course-repository";
import { LectureDto } from "./dto/Lecture-dto";

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async create(createCourseDto: CreateCourseDto) {
    return await this.courseRepository.createCourse(createCourseDto);
  }

  async addLecture(courseId: number, lectureData: LectureDto) {
    return await this.courseRepository.addLectures(courseId, lectureData);
  }

  async findAll() {
    return await this.courseRepository.findAllCourses();
  }

  async findOne(id: number) {
    return await this.courseRepository.findCourseById(id);
  }

  async update(id: number, updateCourseData: UpdateCourseDto) {
    return await this.courseRepository.updateCourse(id, updateCourseData);
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
