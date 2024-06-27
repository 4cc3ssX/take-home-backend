import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from './rabbitmq.service';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('RabbitmqService', () => {
  let service: RabbitMQService;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'RABBITMQ_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'chat_queue',
              queueOptions: {
                durable: false,
              },
            },
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
