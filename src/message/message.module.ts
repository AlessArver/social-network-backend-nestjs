import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';

import { Message } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
