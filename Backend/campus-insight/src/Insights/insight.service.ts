import { Inject, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsightEntity } from "./entities/insight.entity";
import { User } from "@app/User/decorators/user.decorator";
import { UserEntity } from "@app/User/user.entity";
import { CreateInsightDto } from "./dto/insight.dto";
import { Multer } from "multer";
import { Repository } from "typeorm";
import { GetInsightsQueryDto } from "./dto/getInsight.dto";
import { EndlessFeedResponse } from "./types/infiniteFeed.interface";
import { InsightLike } from "./entities/Insight_like.entity";
import { InsightComment } from "./entities/insight_comment.entity";
import { CreateCommentDto } from "@app/Insights/dto/createComment.dto"
import { RepostDto } from "./dto/repost.dto";
import { CreateReportDto } from "./dto/reportInsight.dto";
import { InsightReportEntity } from "./entities/insight_report.entity";
import { AIProcessorService } from "@app/Insights/aiProcessor.service";
import { Logger } from "@nestjs/common";

@Injectable()
export class InsightService {

     private readonly logger = new Logger(AIProcessorService.name)
    constructor(
        @InjectRepository(InsightEntity)
        private readonly insightRepository: Repository<InsightEntity>,

        // Ensure Repository is wrapped around UserEntity here!
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(InsightLike)
        private readonly likeRepository: Repository<InsightLike>,

        @InjectRepository(InsightComment)
        private readonly commentRepository: Repository<InsightComment>,

        @InjectRepository(InsightReportEntity)
        private readonly reportRepository: Repository<InsightReportEntity>,
        private readonly aiProcessor: AIProcessorService
    ) { }

    async createInsight(createInsightDto: CreateInsightDto, file: Multer.File, currentUser): Promise<InsightEntity> {
    const user = await this.userRepository.findOne({ where: { id: currentUser.id } });

    // 1. SAFELY PARSE THE TAGS FROM THE DTO BEFORE ANY SAVING HAPPENS
    let processedTags: string[] = [];
    if (createInsightDto.tagList) {
        if (typeof createInsightDto.tagList === 'string') {
            processedTags = (createInsightDto.tagList as string)
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
        } else if (Array.isArray(createInsightDto.tagList)) {
            processedTags = createInsightDto.tagList;
        }
    }

    // --- ADMIN PATH ---
    if (currentUser.role === "admin") {
        const insightData = {
            ...createInsightDto,
            mediaUrl: file ? file.filename : null,
            authorId: currentUser.id,
            tagList: processedTags, // Forcing our parsed array here
        };
        const insight = this.insightRepository.create(insightData);
        return this.insightRepository.save(insight);
    }

    if (!user) {
        throw new Error('User not found');
    }

    // --- STANDARD USER PATH ---
    const insightData = {
        ...createInsightDto,
        mediaUrl: file ? file.filename : null,
        authorId: currentUser.id,
        tagList: processedTags, // Forcing our parsed array here
    };
    
    const textToScan = `${insightData.title || ''} ${insightData.content || ''}`.trim();
    this.logger.log(`Scanning combined content payload text: "${textToScan}"`);

    const textCheck = await this.aiProcessor.analyzeTextAI(textToScan);
    if (textCheck.isFlagged) {
        const violation = textCheck.reason ?? 'Inappropriate Content';
        throw new HttpException(
            `Post blocked by Validation System. Reason: Content contains ${violation.toLowerCase()}.`,
            HttpStatus.BAD_REQUEST
        );
    }

    // Multi-media scanning layer
    if (insightData.mediaUrl) {
        const mediaCheck = await this.aiProcessor.analyzeMediaFile(insightData.mediaUrl);
        
        if (mediaCheck.isFlagged) {
            const violation = mediaCheck.reason ?? 'Inappropriate Media';
            throw new HttpException(
                `Post blocked by AI System. Reason: Media contains ${violation.toLowerCase()}.`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    const insight = this.insightRepository.create(insightData);
    const createdInsight = await this.insightRepository.save(insight); // Added missing await here for consistency

    return createdInsight;
}

   async editInsight(currentUserId: number, insightId: string, createInsightDto: CreateInsightDto): Promise<InsightEntity> {
    // 1. Verify the insight exists
    const insight = await this.insightRepository.findOne({ where: { id: insightId } });

    if (!insight) {
        throw new HttpException('Insight not found', HttpStatus.NOT_FOUND);
    }

    // 2. Verify ownership
    if (currentUserId !== insight.authorId) {
        throw new HttpException("You are not the author of this insight", HttpStatus.FORBIDDEN);
    }

    // 3. Clean up and split tags if they are arriving as a string
    let processedTags = insight.tagList || [];
    if (createInsightDto.tagList) {
        if (typeof createInsightDto.tagList === 'string') {
            processedTags = (createInsightDto.tagList as string)
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
        } else if (Array.isArray(createInsightDto.tagList)) {
            processedTags = createInsightDto.tagList;
        }
    }

    // 4. Merge incoming payload while forcing TypeORM to use the existing entry ID
    const insightData = {
        ...insight,              // Keep existing unedited fields intact
        ...createInsightDto,     // Overwrite edited fields
        id: insightId,           // CRITICAL: Tells TypeORM to execute an UPDATE instead of an INSERT
        tagList: processedTags,  // Use our safely structured array
        mediaUrl: insight.mediaUrl,
        authorId: currentUserId,
    };

    // 5. Save the updated instance safely
    const updatedInsight = this.insightRepository.create(insightData);
    const savedInsight = await this.insightRepository.save(updatedInsight);

    return savedInsight;
}

    async deleteInsight(currentUserId: number, insightId: string){
        const insight = await this.insightRepository.findOne({ where: { id: insightId } });
        if (!insight) {
            throw new HttpException('Insight not found', HttpStatus.NOT_FOUND);
        }


        if (currentUserId !== insight.authorId) {
            throw new HttpException("You are not the author of this insight", HttpStatus.FORBIDDEN);
        }

        await this.insightRepository.delete(insightId);

         return {
                statusCode: HttpStatus.OK,
                message: "insight deleted successfully"
            };

    }

    async reportInsight(reporterId: number, insightId: string, dto: CreateReportDto) {
        const insight = await this.insightRepository.findOne({ where: { id: insightId } });
        if (!insight) {
            throw new HttpException('Insight not found', HttpStatus.NOT_FOUND);
        }

        // Prevent spam reporting: Check if this user already reported this post
        const alreadyReported = await this.reportRepository.findOne({
            where: { reporterId, insightId }
        });
        if (alreadyReported) {
            throw new HttpException('You have already reported this insight', HttpStatus.CONFLICT);
        }

        const newReport = this.reportRepository.create({
            insightId,
            reporterId,
            reason: dto.reason,
            additionalDetails: dto.additionalDetails || null
        });

        await this.reportRepository.save(newReport);
        return { message: 'Thank you. The content has been flagged for admin review.' };
    }

    async getAllInsights(query: GetInsightsQueryDto, currentUserId?: number): Promise<EndlessFeedResponse> {
    const { type, authorId, limit, cursor, } = query;

    const queryBuilder = this.insightRepository
        .createQueryBuilder('insight')
        .leftJoinAndSelect('insight.author', 'author')
        .leftJoinAndSelect('insight.likes', 'likes')
        .leftJoinAndSelect('insight.comments', 'comments')       
        .leftJoinAndSelect('comments.author', 'commentAuthor') 
        // 1. Join parent insight and its author so repost entries show what is being shared
        .leftJoinAndSelect('insight.parentInsight', 'parentInsight')
        .leftJoinAndSelect('parentInsight.author', 'parentInsightAuthor')
        // 2. Fetch the count of other insights pointing to this one as their parent
        .loadRelationCountAndMap('insight.repostsCount', 'insight.reposts') 
        .orderBy('insight.createdAt', 'DESC')
        .addOrderBy('comments.createdAt', 'ASC')                
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
        // Sanitize authors
        if (insight.author) {
            delete (insight.author as any).password;
            delete (insight.author as any).otpCode;
        }
        if (insight.parentInsight?.author) {
            delete (insight.parentInsight.author as any).password;
            delete (insight.parentInsight.author as any).otpCode;
        }

        if (insight.comments) {
            insight.comments.forEach((comment) => {
                if (comment.author) {
                    delete (comment.author as any).password;
                    delete (comment.author as any).otpCode;
                }
            });
        }

        const likesCount = insight.likes?.length || 0;
        const commentsCount = insight.comments?.length || 0; 
        
        // 3. Fallback to 0 if the mapped count doesn't exist yet
        const repostsCount = (insight as any).repostsCount || 0; 

        const liked = currentUserId
            ? insight.likes?.some(like => like.userId === currentUserId)
            : false;

        return {
            ...insight,
            likesCount,
            commentsCount,
            repostsCount, // Now included in your item payloads!
            liked
        };
    });

    const nextCursor = insights.length > 0 ? insights[insights.length - 1].createdAt : null;

    return {
        insights: sanitizedInsights,
        nextCursor
    } as unknown as EndlessFeedResponse;
}

    async toggleLike(currentUserId: number, insightId: string) {
        // 1. Verify the insight exists
        const insight = await this.insightRepository.findOne({ where: { id: insightId } });
        if (!insight) {
            throw new HttpException('Insight not found', HttpStatus.NOT_FOUND);
        }

        // 2. Check if the user has already liked this insight
        const existingLike = await this.likeRepository.findOne({
            where: { userId: currentUserId, insightId }
        });

        let isLiked = false;

        if (existingLike) {
            // If already liked, remove it (Unlike)
            await this.likeRepository.remove(existingLike);
            isLiked = false;
        } else {
            // If not liked, create a new like record
            const newLike = this.likeRepository.create({
                userId: currentUserId,
                insightId
            });
            await this.likeRepository.save(newLike);
            isLiked = true;
        }

        // 3. Get the updated total like count for this insight
        const likeCount = await this.likeRepository.count({ where: { insightId } });

        // 4. Return the new state so the frontend can update immediately
        return {
            insightId,
            liked: isLiked,
            likesCount: likeCount
        };
    }

    async addComment(currentUserId: number, insightId: string, createCommentDto: CreateCommentDto): Promise<InsightComment> {
        const insight = await this.insightRepository.findOne({ where: { id: insightId } });
        if (!insight) {
            throw new HttpException('Insight not found', HttpStatus.NOT_FOUND);
        }

        const comment = this.commentRepository.create({
            body: createCommentDto.body,
            userId: currentUserId,
            insightId: insightId,

        });

        const savedComment = await this.commentRepository.save(comment);

        // Fetch again to attach the sanitized author profile object
        const commentAdded = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['author'],
        }).then(res => {
            if (res?.author) delete (res.author as any).password;
            return res;
        });

        if (!commentAdded) {
            throw new HttpException('Error occured', HttpStatus.BAD_REQUEST)
        }

        return commentAdded
    }

    async deleteComment(currentUserId: number, commentId: number) {
        if (!currentUserId) {
            throw new HttpException("User is not authorized", HttpStatus.UNAUTHORIZED); // Changed to 401 Unauthorized
        }

        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
        });

        if (!comment) {
            throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }



        // Check if the logged-in user matches the comment author's ID
        if (comment.userId === currentUserId) {

            // 1. FIX: Pass the primitive ID to .delete() instead of the whole object
            await this.commentRepository.delete(commentId);

            // 2. FIX: Return a clean, plain response object instead of an HttpException
            return {
                statusCode: HttpStatus.OK,
                message: "Comment deleted successfully"
            };

        } else {
            // 3. FIX: Changed to FORBIDDEN (403) which represents ownership failure
            throw new HttpException("You are not the author of this comment", HttpStatus.FORBIDDEN);
        }
    }


    async editComment(currentUserId: number, commentId: number, createCommentDto: CreateCommentDto): Promise<InsightComment> {
        // 1. Verify the comment exists
        const comment = await this.commentRepository.findOne({
            where: { id: commentId }
        });

        if (!comment) {
            throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }

        // 2. Verify the user is the author of the comment
        if (comment.userId !== currentUserId) {
            throw new HttpException("You are not the author of this comment", HttpStatus.FORBIDDEN);
        }

        // 3. Update the comment
        const updatedComment = this.commentRepository.create({
            body: createCommentDto.body,
            userId: currentUserId,
            insightId: comment.insightId,
        });

        const savedComment = await this.commentRepository.save(updatedComment);

        const commentAdded = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['author'],
        }).then(res => {
            if (res?.author) delete (res.author as any).password;
            return res;
        });

        if (!commentAdded) {
            throw new HttpException('Error occured', HttpStatus.BAD_REQUEST)
        }

        return commentAdded
    }

    // insights/insight.service.ts
async repostInsight(currentUserId: number, insightId: string, body?: string) {
    // 1. Verify the original insight exists
    const originalInsight = await this.insightRepository.findOne({
        where: { id: insightId }
    });

    if (!originalInsight) {
        throw new HttpException('Original insight not found', HttpStatus.NOT_FOUND);
    }

    // 2. Prevent a user from reposting a repost recursively (Optional, keeps UI clean)
    const targetParentId = originalInsight.parentInsightId ? originalInsight.parentInsightId : originalInsight.id;

    // 3. Create the new repost insight record
   const repost = this.insightRepository.create({
            type: originalInsight.type,              // Inherit the type (TEXT, VIDEO, etc.)
            title: `Repost: ${originalInsight.title}`, // Provide a default title value
            content: body || null,                    // Use 'body' from the method parameters!
            mediaUrl: originalInsight.mediaUrl,
            location: originalInsight.location,
            eventDate: originalInsight.eventDate,
            awardDetail: originalInsight.awardDetail,
            tagList: originalInsight.tagList || [],
            authorId: currentUserId,                  // Matches your entity's authorId column
            parentInsightId: targetParentId,          // Links to the parent insight
        });

    const savedRepost = await this.insightRepository.save(repost);

    // 4. Fetch the fully joined record to return to the frontend
    return await this.insightRepository.findOne({
        where: { id: savedRepost.id },
        relations: ['author', 'parentInsight', 'parentInsight.author']
    }).then(res => {
        // Sanitize sensitive user info across layers safely
        if (res?.author) delete (res.author as any).password;
        if (res?.parentInsight?.author) delete (res.parentInsight.author as any).password;
        return res;
    });
}





}