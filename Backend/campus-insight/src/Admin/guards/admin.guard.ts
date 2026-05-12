import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ExpressRequest } from "@app/types/expressRequest.type";
import { UserRole } from "@app/types/userRole.type";

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<ExpressRequest>();

        // 1. Check if user exists (AuthGuard usually handles this, but safety first)
        if (!request.user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        // 2. Check if the role is Admin
        if (request.user.role === UserRole.ADMIN) {
            return true;
        }

        // 3. If they are a student trying to access admin routes
        throw new HttpException('Forbidden: Admin access required', HttpStatus.FORBIDDEN);
    }
}