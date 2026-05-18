import { Module } from "@nestjs/common";
import { InsightController } from "./insight.controller";
import { InsightService } from "./insight.service";
import { Type } from "class-transformer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InsightEntity } from "./insight.entity";
import { User } from "@app/User/decorators/user.decorator";
import { UserEntity } from "@app/User/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([InsightEntity, UserEntity])],
    controllers: [InsightController],
    providers: [InsightService],
})
export class InsightModule {}