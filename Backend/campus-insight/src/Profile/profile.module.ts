import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "@app/User/user.entity";
import { FollowUserEntity } from "./followUser.entity";
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, FollowUserEntity])],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule {}
