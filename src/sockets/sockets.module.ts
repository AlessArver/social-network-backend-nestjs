import { Module } from '@nestjs/common';

import { UserModule } from './../user/user.module';

import { SocketsGateway } from './sockets.gateway';

@Module({
  imports: [UserModule],
  providers: [SocketsGateway],
})
export class SocketsModule {}
