import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import { DatabaseModule } from './database/database.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RedisClientModule } from './redis-client/redis-client.module';

@Module({
  imports: [CourseModule, DatabaseModule, RedisClientModule, RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
