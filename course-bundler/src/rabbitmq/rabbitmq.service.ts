import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbimqClient: ClientProxy,
  ) {}

  async sendMessage(pattern: string, data: any) {
    return this.rabbimqClient.emit(pattern, data);
  }
}
