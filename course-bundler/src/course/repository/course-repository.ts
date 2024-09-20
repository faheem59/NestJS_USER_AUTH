import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class CourseRepository {
    constructor(
        @InjectRepository(Course) private readonly courseRepository: Repository<Course>,
    ) { }


    async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
        return await this.courseRepository.create(createCourseDto);
    }


    async findAllCourses(): Promise<Course[]> {
        return await this.courseRepository.find();
    }

    // async findCourseById(id: number): Promise<Course> {
    //     return await this.findOne(id);
    // }

    // async updateCourse(id: number, updateCourseDto: Partial<CreateCourseDto>): Promise<Course> {
    //     await this.update(id, updateCourseDto);
    //     return this.findOne(id);
    // }

    // async removeCourse(id: number): Promise<void> {
    //     await this.delete(id);
    // }
}
