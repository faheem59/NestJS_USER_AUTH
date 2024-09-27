import { Repository } from "typeorm";
import { Course } from "../entities/course.entity";
import { CreateCourseDto } from "../dto/create-course.dto";
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RedisClientService } from "src/redis-client/redis-client.service";
import { LectureDto } from "../dto/Lecture-dto";
import { Lecture } from "../entities/lecture.entity";
import { CloudinaryService } from "../../config/cloudinary.service";
import { ERROR_MESSAGES } from "../../utils/error-messages-constants";

@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Lecture)
    private readonly lectureRepositroy: Repository<Lecture>,
    private readonly redisClient: RedisClientService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Admin and instructor can only create the courses
  async createCourse(
    courseData: CreateCourseDto,
    file: Express.Multer.File,
  ): Promise<Course> {
    try {
      const publicId = courseData.poster?.public_id || `course_${Date.now()}`;
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        publicId,
      );
      const course = this.courseRepository.create({
        ...courseData,
        poster: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        },
      });

      await this.courseRepository.save(course);
      return course;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Admin and instructor can only add the lectures in the course
  async addLectures(
    courseId: number,
    lectureData: LectureDto,
    file: Express.Multer.File,
  ): Promise<Lecture> {
    try {
      const publicId = lectureData.video?.public_id || `course_${Date.now()}`;
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }

      const uploadResult = await this.cloudinaryService.uploadVideo(
        file,
        publicId,
      );
      const lecture = new Lecture();
      Object.assign(lecture, lectureData);

      lecture.course = course;
      lecture.video = lecture.video || {};
      lecture.video.url = uploadResult.secure_url;
      lecture.video.public_id = uploadResult.public_id;
      return await this.lectureRepositroy.save(lecture);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // All can see the courses
  async findAllCourses(): Promise<Course[]> {
    try {
      return await this.courseRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Get a single course
  async findCourseById(id: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({ where: { id } });
      if (!course) {
        throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }
      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }

  // Admin and instructor can only update the course
  async updateCourse(
    id: number,
    updateCourseDto: Partial<CreateCourseDto>,
  ): Promise<Course> {
    try {
      await this.courseRepository.update(id, updateCourseDto);
      const updatedCourse = await this.courseRepository.findOne({
        where: { id },
      });
      if (!updatedCourse) {
        throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }
      return updatedCourse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }

  // All can see the lectures
  async findAllLectures(): Promise<Lecture[]> {
    try {
      return await this.lectureRepositroy.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Get a single lecture
  async findLectureById(lectureId: number): Promise<Lecture> {
    try {
      const lecture = await this.lectureRepositroy.findOne({
        where: { id: lectureId },
      });
      if (!lecture) {
        throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
      }
      return lecture;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }

  // Admin and instructor can only remove the course
  async removeCourse(id: number): Promise<void> {
    try {
      await this.courseRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Admin and instructor can only remove the lecture
  async removeLecture(id: number): Promise<void> {
    try {
      await this.lectureRepositroy.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Admin and instructor can only restore the course
  async restoreCourse(courseId: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        withDeleted: true,
      });
      if (!course) {
        throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }
      course.deletedAt = null;
      return await this.courseRepository.save(course);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }

  // Admin and instructor can only restore the lecture
  async restoreLecture(lectureId: number): Promise<Lecture> {
    try {
      const lecture = await this.lectureRepositroy.findOne({
        where: { id: lectureId },
        withDeleted: true,
      });
      if (!lecture) {
        throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
      }

      lecture.deletedAt = null;
      return await this.lectureRepositroy.save(lecture);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }
}
