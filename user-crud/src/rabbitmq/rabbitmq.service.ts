import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Common } from "../enum/common-enum";

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject(Common.RABBITMQ_CLIENT) private readonly client: ClientProxy,
  ) {}
  async sendMessage(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }
}
