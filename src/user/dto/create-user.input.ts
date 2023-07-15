import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field({ nullable: true })
  avatar: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
