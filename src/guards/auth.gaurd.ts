import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { validateToken } from 'utils/validateToken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext();

    if (ctx.req) {
      if (!ctx?.req?.headers?.authorization) {
        return false;
      }

      ctx.user = await validateToken(ctx?.req?.headers?.authorization);

      return true;
    } else {
      if (!ctx?.headers?.authorization) {
        return false;
      }
      ctx.user = await validateToken(ctx?.headers?.authorization);

      return true;
    }
  }
}
