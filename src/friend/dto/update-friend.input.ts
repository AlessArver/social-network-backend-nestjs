import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateFriendInput {
  @Field()
  id: string;

  @Field()
  status: string;
}
