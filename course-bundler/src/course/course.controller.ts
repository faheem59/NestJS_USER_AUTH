import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Public } from "./decorator/public-decorator";
import { LectureDto } from "./dto/Lecture-dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "./decorator/role-decorator";
import { Role } from "src/enum/role-enum";
import { CreateQuestionDto } from "./dto/create-questions.dto";
import { CreateQuizDto } from "./dto/create-quiz-dto";

@Controller("course")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Public Routes
  @Public()
  @Get("/quiz")
  getAllQuiz() {
    return this.courseService.getAllQuiz();
  }

  @Public()
  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.courseService.findOne(+id);
  }

  @Public()
  @Get("lecture")
  findAllLectures() {
    return this.courseService.findAllLectures();
  }

  @Public()
  @Get(":id/lecture")
  findLectureById(@Param("id") id: number) {
    return this.courseService.findLectureById(id);
  }

  // Admin/Instructor Routes
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async createCourse(
    @Body() courseData: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.courseService.create(courseData, file);
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post(":courseId/lectures")
  @UseInterceptors(FileInterceptor("file"))
  async addLecture(
    @Param("courseId") courseId: number,
    @Body() lectureData: LectureDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.courseService.addLecture(courseId, lectureData, file);
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Delete(":id")
  removeCourse(@Param("id") id: string) {
    return this.courseService.removeCourse(+id);
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Delete(":id/lecture")
  removeLecture(@Param("id") id: number) {
    return this.courseService.removeLecture(id);
  }

  // Quiz and Question Routes
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post("/:id/quiz")
  createQuiz(@Param("id") id: number, @Body() quizData: CreateQuizDto) {
    return this.courseService.createQuiz(id, quizData);
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post("/:id/question")
  addQuestion(
    @Param("id") id: number,
    @Body() questionData: CreateQuestionDto[],
  ) {
    return this.courseService.addQuestion(id, questionData);
  }
}
