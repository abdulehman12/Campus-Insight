import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthGuard } from "./guards/auth.guard";

@Module({
    
    imports: [TypeOrmModule.forFeature([UserEntity])],    
    providers: [UserService, AuthGuard],
    controllers: [UserController],
    exports: [UserService, AuthGuard],
})
export class UserModule {}