
import { ExpressRequest } from "@app/types/expressRequest.type";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
@Injectable()
export class AuthGuard implements CanActivate {
    canActivate( context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<ExpressRequest>();
        if (request.user) {
            return true;
        }

        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
}