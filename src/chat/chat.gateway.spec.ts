import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { Socket, io } from 'socket.io-client';
import { INestApplication } from '@nestjs/common';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import configuration from 'src/config/configuration';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let app: INestApplication;
  let ioClient: Socket;
  let clientProxy: ClientProxy;
  let rabbitMQService: RabbitMQService;
  let configService: ConfigService<ReturnType<typeof configuration>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RabbitMQModule],
      providers: [ChatGateway],
    }).compile();

    app = module.createNestApplication();
    configService = app.get(ConfigService);
    gateway = module.get<ChatGateway>(ChatGateway);
    clientProxy = module.get<ClientProxy>('RABBITMQ_SERVICE');
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);

    const port = configService.get('PORT');

    // Create a new socket.io client
    ioClient = io(`http://localhost:${port}`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    app.listen(port);
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

    ioClient.on('message', (data) => {
      expect(data.name).toBe('System');
      expect(data.message).toBe(`${mockName} has joined the chat`);
    });

    ioClient.emit('register', mockName);

    ioClient.disconnect();
  }, 10000);

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
