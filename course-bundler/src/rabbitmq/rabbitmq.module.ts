import { Module } from "@nestjs/common";
import { RabbitmqService } from "./rabbitmq.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Common } from "src/utils/constants/common.constant";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "RABBITMQ_CLIENT",
        transport: Transport.RMQ,
        options: {
          urls: ["amqp://localhost:5672"],
          queue: "user_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [
    RabbitmqService,
    {
      provide: Common.REBBITMQ_CLIENT,
      useClass: RabbitmqModule,
    },
  ],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
