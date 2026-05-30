import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../User/user.module'; // Import UserModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../User/user.entity';
import { AdminGuard } from './guards/admin.guard';
import { InsightReportEntity } from '@app/Insights/entities/insight_report.entity';
import { InsightEntity } from '@app/Insights/entities/insight.entity';
import { InsightComment } from '@app/Insights/entities/insight_comment.entity';
import { InsightLike } from '@app/Insights/entities/Insight_like.entity';

@Module({
  imports: [
    UserModule, // Gives access to UserService
    TypeOrmModule.forFeature([UserEntity, InsightReportEntity, InsightEntity, InsightComment, InsightLike]), // Gives access to User Repository
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}