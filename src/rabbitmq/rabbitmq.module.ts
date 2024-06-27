import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { Config } from 'src/config/configuration';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule.forRoot({ load: [configuration] })],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService<Config>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'chat_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
