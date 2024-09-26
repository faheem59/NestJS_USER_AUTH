import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentService } from './payment/payment.service';
import { PaymentModule } from './payment/payment.module';
import { DatabaseModule } from './config/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    PaymentModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 60 * 60 * 3600,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PaymentService, ConfigService],
})
export class AppModule {}
