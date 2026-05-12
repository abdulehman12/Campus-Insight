import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequest } from '@app/types/expressRequest.type';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<ExpressRequest>();

  // If the AuthMiddleware did its job, the user is here
  if (!request.user) {
    return null;
  }

  // If you pass a specific property name like @User('id'), return just that
  if (data) {
    return request.user[data];
  }

  // Otherwise, return the whole user object
  return request.user;
});