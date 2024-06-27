import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async publishMessage(pattern: string, message: any): Promise<any> {
    return lastValueFrom(this.client.emit(pattern, message));
  }
}
