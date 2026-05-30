import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../User/user.entity';
import { UserRole } from '@app/types/userRole.type';
import { UserLoginDto } from '@app/User/dto/userLogin.dto';
import { ConfigService } from '@nestjs/config';
import { InsightReportEntity } from '../Insights/entities/insight_report.entity';
import { InsightEntity } from "../Insights/entities/insight.entity";
import { HttpException, HttpStatus } from "@nestjs/common";
import { InsightComment } from "../Insights/entities/insight_comment.entity";
import { InsightLike } from "../Insights/entities/Insight_like.entity";
import { Not, IsNull } from "typeorm";
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(InsightReportEntity)
    private readonly insightReportRepository: Repository<InsightReportEntity>,
    @InjectRepository(InsightEntity)
    private readonly insightRepository: Repository<InsightEntity>,
    @InjectRepository(InsightComment)
    private readonly commentRepository: Repository<InsightComment>,
    @InjectRepository(InsightLike)
    private readonly likeRepository: Repository<InsightLike>,

    private readonly configService: ConfigService
  ) { }



  async getAllStudents(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      where: { role: UserRole.STUDENT },
      select: ['id', 'username', 'roll_no', 'isVerified', 'otpCode', "image", "mobile_no", "email"]
    });
  }

  async getPendingApprovals(): Promise<UserEntity[]> {
    const unverifiedStudents = await this.userRepository.find({
      where: { isVerified: false, role: UserRole.STUDENT },
      select: ['id', 'username', 'roll_no', 'isVerified', 'otpCode', "image", "mobile_no", "email"]
    });
    return unverifiedStudents;
  }

  async getReportContent() {
    return await this.insightReportRepository.find({
      relations: ['insight', 'reporter', 'insight.author'],
      order: { createdAt: 'DESC' }
    }).then(reports => {
      // Sanitize database user info from the response
      reports.forEach(report => {
        if (report.reporter) delete (report.reporter as any).password;
        if (report.insight?.author) delete (report.insight.author as any).password;
      });
      return reports;
    });
  }

  async deleteInsight(currentUser: any, insightId: string) {
    const insight = await this.insightRepository.findOne({ where: { id: insightId } });
    if (!insight) {
      throw new HttpException('Insight not found', HttpStatus.NOT_FOUND);
    }

    // Check if the logged-in user matches the insight author's ID
    if (!(currentUser.role === "admin")) {
      throw new HttpException("You are not the author of this insight", HttpStatus.FORBIDDEN);
    }

    await this.insightRepository.delete(insightId);

    return {
      statusCode: HttpStatus.OK,
      message: "insight deleted successfully"
    };
  }

  async getAdminAnalytics() {
    // 1. Run global counts in parallel for optimal speed
    const [totalInsights, totalUsers, totalComments, totalLikes, totalReports] = await Promise.all([
      this.insightRepository.count(),
      this.userRepository.count(),
      this.commentRepository.count(),
      this.likeRepository.count(),
      this.insightReportRepository.count(),
    ]);

    // 2. Calculate engagement ratios safely
    const avgLikesPerInsight = totalInsights > 0 ? parseFloat((totalLikes / totalInsights).toFixed(2)) : 0;
    const avgCommentsPerInsight = totalInsights > 0 ? parseFloat((totalComments / totalInsights).toFixed(2)) : 0;

    // 3. Aggregate posts count grouped by InsightType
    const typeBreakdownRaw = await this.insightRepository
      .createQueryBuilder('insight')
      .select('insight.type', 'type')
      .addSelect('COUNT(insight.id)', 'count')
      .groupBy('insight.type')
      .getRawMany();

    const typeBreakdown = typeBreakdownRaw.reduce((acc, current) => {
      acc[current.type] = parseInt(current.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // 4. Track repost metrics
    const totalReposts = await this.insightRepository.count({
      where: { parentInsightId: Not(IsNull()) }
    });
    const originalInsights = totalInsights - totalReposts;

    // 5. 🔥 NEW: Extract and rank Trending Tags (Top 5)
    // This splits the comma-separated string, trims spacing, ranks them by total usage
    const trendingTagsRaw = await this.insightRepository.query(`
           SELECT 
        TRIM(LOWER(unnested_tag)) as tag, 
        COUNT(*) as count 
    FROM 
        insights, 
        UNNEST(string_to_array(insights."tagList", ',')) AS unnested_tag
    WHERE 
        insights."tagList" IS NOT NULL AND insights."tagList" != ''
    GROUP BY 
        tag
    ORDER BY 
        count DESC
    LIMIT 5
        `);

    // Format the raw tags database result to a clean, readable structure
    const trendingTags = trendingTagsRaw.map((row: any) => ({
      tag: row.tag,
      count: parseInt(row.count, 10)
    }));

    // 6. Return combined dashboard data structure
    return {
      generatedAt: new Date(),
      platformOverview: {
        totalUsers,
        totalInsights,
        originalInsights,
        totalReposts,
        totalComments,
        totalLikes,
        activeReportsQueue: totalReports,
      },
      engagementMetrics: {
        avgLikesPerInsight,
        avgCommentsPerInsight,
        interactionRatio: totalUsers > 0 ? parseFloat(((totalLikes + totalComments) / totalUsers).toFixed(2)) : 0
      },
      contentDistribution: typeBreakdown,
      trendingTags // Now included directly in your admin output payload!
    };
  }








}