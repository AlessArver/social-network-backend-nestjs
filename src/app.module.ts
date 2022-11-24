import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { MessageModule } from './message/message.module';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'socialnetwork',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), './graphql-schema.gql'),
      driver: ApolloDriver,
      context: ({ req }) => ({ headers: req.headers }),
    }),
    UserModule,
    PostModule,
    MessageModule,
    FriendModule,
  ],
})
export class AppModule {}
