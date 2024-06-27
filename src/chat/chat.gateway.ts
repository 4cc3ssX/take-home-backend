import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  private users: { id: string; name: string }[] = [];

  @WebSocketServer() io: Server;

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  afterInit() {
    this.logger.log('ChatGateway Initialized');
  }

  handleConnection(client: any) {
    const { sockets } = this.io.sockets;

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);

    // Remove user on disconnect
    const userIndex = this.users.findIndex((user) => user.id === client.id);
    if (userIndex !== -1) {
      const user = this.users.splice(userIndex, 1)[0];
      this.io.emit('users', this.users);
      this.io.emit('message', {
        name: 'System',
        message: `${user.name} has left the chat`,
      });
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() name: string,
  ): void {
    this.users.push({ id: client.id, name });

    this.io.emit('users', this.users);
    this.io.emit('message', {
      name: 'System',
      message: `${name} has joined the chat`,
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ): Promise<void> {
    const user = this.users.find((user) => user.id === client.id);
    if (user) {
      const message = { name: user.name, message: payload };
      await this.rabbitMQService.publishMessage('chat.message', message);
      this.io.emit('message', message);
    }
  }
}
