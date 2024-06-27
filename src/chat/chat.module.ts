import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [RabbitMQModule],
  providers: [ChatGateway],
})
export class ChatModule {}
