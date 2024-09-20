import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/user-dto';

@Injectable()
export class CourseService {

  @EventPattern('user_created')
  handleUserCreated(@Payload() data: CreateUserDto) {
    return this
  }
  create(createCourseDto: CreateCourseDto) {

  }

  findAll() {
    return `This action returns all course`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
