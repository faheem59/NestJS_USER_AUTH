import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import { DatabaseModule } from './database/database.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RedisClientModule } from './redis-client/redis-client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CourseModule,
    DatabaseModule,
    RedisClientModule,
    RabbitmqModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
