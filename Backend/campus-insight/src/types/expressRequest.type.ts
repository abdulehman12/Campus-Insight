import { UserEntity } from '@app/User/user.entity';
import { Request } from 'express';

export interface ExpressRequest extends Request {
  user?: UserEntity | undefined;
}