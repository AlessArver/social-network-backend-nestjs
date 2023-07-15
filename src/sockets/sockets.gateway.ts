import { UserService } from './../user/user.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private userService: UserService) {}

  @SubscribeMessage('userOnline')
  async userOnline(@MessageBody() data: { id: string; socket_id: string }) {
    const user = await this.userService.updateOnline({
      ...data,
      is_online: true,
    });
    this.server.emit(`user-${user.id}`, user);
  }

  async handleDisconnect(@ConnectedSocket() client: any) {
    const user = await this.userService.findBySocketId(client.id);
    if (user) {
      const newUser = await this.userService.updateOnline({
        id: user.id,
        socket_id: null,
        is_online: false,
      });
      this.server.emit(`user-${newUser.id}`, newUser);
    }
  }
}
