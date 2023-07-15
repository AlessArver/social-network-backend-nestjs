import { SocketsModule } from './sockets/sockets.module';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { MessageModule } from './message/message.module';
import { FriendModule } from './friend/friend.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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
    SocketsModule,
    MailModule,
  ],
})
export class AppModule {}
