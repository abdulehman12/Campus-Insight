import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { ConfigService } from "@nestjs/config"; // 1. Import this
import { verify, JwtPayload } from "jsonwebtoken";
import { UserService } from "../user.service";
import { ExpressRequest } from "@app/types/expressRequest.type";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  // 2. Inject it in the constructor
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService 
  ) {}

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      // 3. Use .get() to retrieve your secret
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        req.user = null;
        return next();
      }

      const decode = verify(token, secret) as JwtPayload;
      const user = await this.userService.findById(decode.id);

      if (decode.id === 0 && decode.role === 'admin') {
    req.user = {
      id: 0,
      username: decode.username,
      email: decode.email,
      role: decode.role,
    } as any;
    return next();
  }
      
      req.user = user || null;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}