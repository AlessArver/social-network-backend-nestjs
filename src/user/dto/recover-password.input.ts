import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RecoverPasswordInput {
  @Field()
  token!: string;

  @Field()
  password!: string;
}
