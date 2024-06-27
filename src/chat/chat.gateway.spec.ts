import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { Socket, io } from 'socket.io-client';
import { INestApplication } from '@nestjs/common';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let app: INestApplication;
  let ioClient: Socket;
  let clientProxy: ClientProxy;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RabbitMQModule],
      providers: [ChatGateway],
    }).compile();

    app = module.createNestApplication();
    gateway = module.get<ChatGateway>(ChatGateway);
    clientProxy = module.get<ClientProxy>('RABBITMQ_SERVICE');
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);

    // Create a new socket.io client
    ioClient = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    app.listen(3000);
  });

  afterEach(async () => {
    ioClient.close();
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle register', async () => {
    const mockName = 'Ryam';

    ioClient.connect();
    ioClient.emit('register', mockName);

    await new Promise<void>((resolve) => {
      ioClient.on('connect', () => {
        console.log('connected');
      });

      ioClient.on('message', (data) => {
        expect(data.name).toBe('System');
        expect(data.message).toBe(`${mockName} has joined the chat`);
        resolve();
      });
    });
    ioClient.disconnect();
  });

  it('should handle message', async () => {
    jest.spyOn(clientProxy, 'emit').mockReturnValue(of(true));

    const mockClient = { id: 'socketId123' } as Socket; // Mock socket ID
    const mockPayload = 'Hello, world!';
    const mockName = 'Ryam';
    gateway['users'] = [{ id: mockClient.id, name: mockName }];

    await gateway.handleMessage(mockClient, mockPayload);

    const message = { name: mockName, message: mockPayload };
    const result = await rabbitMQService.publishMessage(
      'chat.message',
      message,
    );
    expect(result).toBe(true);
    expect(clientProxy.emit).toHaveBeenCalledWith('chat.message', message);
  });
});
