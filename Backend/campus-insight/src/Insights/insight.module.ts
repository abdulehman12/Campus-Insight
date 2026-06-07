import { Module } from "@nestjs/common";
import { InsightController } from "./insight.controller";
import { InsightService } from "./insight.service";
import { Type } from "class-transformer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InsightEntity } from "./entities/insight.entity";
import { User } from "@app/User/decorators/user.decorator";
import { UserEntity } from "@app/User/user.entity";
import { InsightLike } from "./entities/Insight_like.entity";
import { InsightComment } from "./entities/insight_comment.entity";
import { InsightReportEntity } from "./entities/insight_report.entity";
import { AIProcessorService } from "./aiProcessor.service";
@Module({
    imports: [TypeOrmModule.forFeature([InsightEntity, UserEntity, InsightLike, InsightComment, InsightReportEntity])],
    controllers: [InsightController],
    providers: [InsightService,AIProcessorService],
})
export class InsightModule {}