import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Common } from "../utils/constants/common.constant";

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject(Common.REBBITMQ_CLIENT) private readonly rabbimqClient: ClientProxy,
  ) {}

  async sendMessage(pattern: string, data: any) {
    return this.rabbimqClient.emit(pattern, data);
  }
}
