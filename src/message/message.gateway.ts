import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver(() => Message)
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  // @SubscribeMessage('createMessage')
  // @Mutation(() => Message)
  // create(@MessageBody() createMessageDto: CreateMessageDto) {
  //   return this.messageService.create(createMessageDto);
  // }

  // @SubscribeMessage('findAllMessage')
  // @Query(() => Message)
  // findAll() {
  //   return this.messageService.findAll();
  // }

  // @SubscribeMessage('removeMessage')
  // remove(@MessageBody() id: number) {
  //   return this.messageService.remove(id);
  // }

  // @SubscribeMessage('typing')
  // typing(@MessageBody() id: number) {
  //   return this.messageService.remove(id);
  // }
}
