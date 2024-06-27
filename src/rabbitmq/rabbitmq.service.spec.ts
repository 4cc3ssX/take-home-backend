import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from './rabbitmq.service';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { of } from 'rxjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { Config } from 'src/config/configuration';

describe('RabbitmqService', () => {
  let service: RabbitMQService;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
    clientProxy = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish a message', async () => {
    jest.spyOn(clientProxy, 'emit').mockReturnValue(of(true));

    const result = await service.publishMessage('chat.message', {
      message: 'test message',
    });
    expect(result).toBe(true);
    expect(clientProxy.emit).toHaveBeenCalledWith('chat.message', {
      message: 'test message',
    });
  });
});
