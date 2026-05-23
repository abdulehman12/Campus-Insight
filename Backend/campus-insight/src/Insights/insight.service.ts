import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsightEntity } from "./insight.entity";
import { User } from "@app/User/decorators/user.decorator";
import { UserEntity } from "@app/User/user.entity";
import { CreateInsightDto } from "./dto/insight.dto";
import { Multer } from "multer";
import { Repository } from "typeorm";
import { GetInsightsQueryDto } from "./dto/getInsight.dto";
import { EndlessFeedResponse } from "./types/infiniteFeed.interface";

@Injectable()
export class InsightService {
    constructor(
        @InjectRepository(InsightEntity)
        private readonly insightRepository: Repository<InsightEntity>,

        // Ensure Repository is wrapped around UserEntity here!
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    async createInsight(createInsightDto: CreateInsightDto, file: Multer.File, currentUser ): Promise<InsightEntity> {
        const user = await this.userRepository.findOne({ where: { id: currentUser.id } });

        if(currentUser.role === "admin"){
            const insightData = {
            ...createInsightDto,
            mediaUrl: file ? file.filename : null,
            authorId: currentUser.id,
        };
         const insight = this.insightRepository.create(insightData);
        return this.insightRepository.save(insight);
        }
        if (!user) {
            throw new Error('User not found');
        }

        const insightData = {
            ...createInsightDto, 
            mediaUrl: file ? file.filename : null,
            authorId: currentUser.id,
        };
        const insight = this.insightRepository.create(insightData);
        return this.insightRepository.save(insight);
    }

    async getAllInsights(query: GetInsightsQueryDto): Promise<EndlessFeedResponse> {
        const { type, authorId, limit, cursor, } = query;
        const queryBuilder = this.insightRepository
            .createQueryBuilder('insight')
            .leftJoinAndSelect('insight.author', 'author')
            .orderBy('insight.createdAt', 'DESC')
            .take(limit);

        if (type) {
            queryBuilder.andWhere('insight.type = :type', { type });
        }
        if (authorId) {
            queryBuilder.andWhere('insight.authorId = :authorId', { authorId });
        }
        if (cursor) {
            queryBuilder.andWhere('insight.createdAt < :cursor', { cursor });
        }
        if (query.tag) {
            queryBuilder.andWhere('insight.tagList ILIKE :tag', { tag: `%${query.tag}%` });
        }

        const insights = await queryBuilder.getMany();

        const sanitizedInsights = insights.map((insight) => {
            if (insight.author) {
                delete (insight.author as any).password;
                delete (insight.author as any).otpCode;
            }
            return insight;
        });

        const nextCursor = insights.length === limit ? insights[insights.length - 1].createdAt?.toISOString() : null;

        return {
            data: sanitizedInsights,
            meta: {
                fetchedCount: insights.length,
                nextCursor: nextCursor, // Send this back so the frontend can request the next batch
                hasMore: insights.length === limit, // Quick flag for frontend infinite scroll to stop listening
            },
        }
    }
}