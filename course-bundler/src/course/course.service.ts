import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CourseRepository } from "./repository/course-repository";
import { LectureDto } from "./dto/Lecture-dto";
import { RedisClientService } from "src/redis-client/redis-client.service";
import { RabbitmqService } from "src/rabbitmq/rabbitmq.service";
import { Common } from "src/utils/constants/common.constant";
import { CreateQuizDto } from "./dto/create-quiz-dto";
import { CreateQuestionDto } from "./dto/create-questions.dto";
import { Quiz } from "./entities/quiz.entity";

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly redisService: RedisClientService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async create(createCourseData: CreateCourseDto, file: Express.Multer.File) {
    await this.rabbitmqService.sendMessage(
      Common.COURSE_CREATED,
      createCourseData,
    );
    return await this.courseRepository.createCourse(createCourseData, file);
  }

  async addLecture(
    courseId: number,
    lectureData: LectureDto,
    file: Express.Multer.File,
  ) {
    await this.redisService.setValue(Common.LECTURE, lectureData);
    return await this.courseRepository.addLectures(courseId, lectureData, file);
  }

  async findAll() {
    return await this.courseRepository.findAllCourses();
  }

  async findOne(id: number) {
    await this.redisService.setValue(Common.COURSE, id);
    return await this.courseRepository.findCourseById(id);
  }

  async update(id: number, updateCourseData: UpdateCourseDto) {
    return await this.courseRepository.updateCourse(id, updateCourseData);
  }

  async findAllLectures() {
    return await this.courseRepository.findAllLectures();
  }

  async findLectureById(id: number) {
    return this.courseRepository.findLectureById(id);
  }

  async removeCourse(id: number) {
    return await this.courseRepository.removeCourse(id);
  }

  async removeLecture(id: number) {
    return await this.courseRepository.removeLecture(id);
  }

  async createQuiz(id: number, quizData: CreateQuizDto) {
    return await this.courseRepository.createQuiz(id, quizData);
  }

  async addQuestion(id: number, questionData: CreateQuestionDto[]) {
    return this.courseRepository.addQuestions(id, questionData);
  }

  async getAllQuiz(): Promise<Quiz[]> {
    return this.courseRepository.getAllQuiz();
  }
}
