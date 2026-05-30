import { Body, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe, Param, Delete, ParseIntPipe, Put } from "@nestjs/common";
import { InsightService } from "./insight.service";
import { AuthGuard } from "@app/User/guards/auth.guard";
import { CreateInsightDto } from "./dto/insight.dto";
import { FileInterceptor } from "@nestjs/platform-express/multer/interceptors/file.interceptor";
import { diskStorage } from "multer";
import { extname } from "path";
import type { Multer } from "multer";
import { User } from "@app/User/decorators/user.decorator";
import { GetInsightsQueryDto } from "./dto/getInsight.dto";
import { CreateInsightResponse } from "./types/createInsight.interface";
import { EndlessFeedResponse } from "./types/infiniteFeed.interface";
import { CreateCommentDto } from "./dto/createComment.dto";
import { InsightComment } from "./entities/insight_comment.entity";
import { RepostDto } from "./dto/repost.dto";
import { CreateReportDto } from "./dto/reportInsight.dto";
import { HttpCode, HttpStatus } from "@nestjs/common";
@Controller("insights")
export class InsightController {
    constructor(
        private readonly insightService: InsightService,
    ) {}

    @Post('create-insight')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image',{
  storage: diskStorage({
    destination: './uploads/insights',
    filename: (req, file, cb) => {
      const name = Date.now() + extname(file.originalname);
      cb(null, name);
    },
  }),
}))
    async createInsight(@User() currentUser, @Body() createInsightDto: CreateInsightDto, @UploadedFile() file: Multer.File): Promise<CreateInsightResponse> {
        const insight = await this.insightService.createInsight(createInsightDto, file, currentUser);
        return insight
    }

    // Add a new endpoint for editing a insight (PUT)
    // this will be a PUT request to /insights/:id
    // the request body will contain the updated insight content

    @Put(':id/edit-insight')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image',{
  storage: diskStorage({
    destination: './uploads/insights',
    filename: (req, file, cb) => {
      const name = Date.now() + extname(file.originalname);
      cb(null, name);
    },
  }),
}))
    async editInsight(@User('id') currentUserId:number,@Param('id') insightId: string,@Body() createInsightDto: CreateInsightDto){
        return await this.insightService.editInsight(currentUserId, insightId, createInsightDto)
    }

    // Add a new endpoint for deleting a insight (DELETE)
    // this will be a DELETE request to /insights/:id

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteInsight(@User('id') currentUserId:number,@Param('id') insightId: string){
        return await this.insightService.deleteInsight(currentUserId, insightId)
    }

    @Post(':id/report')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async report(
        @User('id') currentUserId: number,
        @Param('id') insightId: string,
        @Body() createReportDto: CreateReportDto
    ) {
        return await this.insightService.reportInsight(currentUserId, insightId, createReportDto);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getAllInsights(@Query() query: GetInsightsQueryDto): Promise<EndlessFeedResponse> {
        return this.insightService.getAllInsights(query);
    }
    @Post(':id/like')
    @UseGuards(AuthGuard)
    async toggleLike(@User('id') currentUserId:number, @Param('id') insightId: string){
      return await this.insightService.toggleLike(currentUserId, insightId)
    }

    @Post(':id/comment')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async addComment(@User('id') currentUserId: number,@Body() createCommentDto: CreateCommentDto, @Param('id') insightId: string){
      return await this.insightService.addComment(currentUserId, insightId, createCommentDto)
    }

    @Delete('comment/:commentId')
    @UseGuards(AuthGuard)
    async deleteComment(@User('id') currentUserId:number,@Param('commentId', ParseIntPipe) commentId: number){
        return await this.insightService.deleteComment(currentUserId, commentId)
    }

    // add a new endpoint for editing a comment (PUT)
    // this will be a PUT request to /insights/comment/:commentId
    // the request body will contain the updated comment content

    @Put('comment/:commentId')
    @UseGuards(AuthGuard)
    async editComment(@User('id') currentUserId:number,@Param('commentId', ParseIntPipe) commentId: number,@Body() createCommentDto: CreateCommentDto){
        return await this.insightService.editComment(currentUserId, commentId, createCommentDto)
    }

    // Add a new endpoint for reposting an insight
    // This will be a POST request to /insights/:id/repost
    // The request body will contain the text content of the repost

    // Example request:
    // POST /insights/5f7e5d4f-f1c9-4e4a-b7a1-c4d6c0a9c3b1/repost
    // Content-Type: application/json
    // {
    // "body": "Repost content goes here"
    // }

    // Example response:
    // {
    // "id": "5f7e5d4f-f1c9-4e4a-b7a1-c4d6c0a9c3b1",
    // "type": "TEXT",
    // "title": "Repost: Original Insight Title",
    // "content": "Repost content goes here",
    // "mediaUrl": null,
    // "location": null,
    // "eventDate": null,
    // "awardDetail": null,
    // "tagList": [],
    // "createdAt": "2023-03-01T18:00:00.000Z",
    // "updatedAt": "2023-03-01T18:00:00.000Z",
    // "parentInsightId": "5f7e5d4f-f1c9-4e4a-b7a1-c4d6c0a9c3b1",
    // "parentInsight": {
    // "id": "5f7e5d4f-f1c9-4e4a-b7a1-c4d6c0a9c3b1",
    // "type": "TEXT",
    // "title": "Original Insight Title",
    // "content": "Original insight content goes here",
    // "mediaUrl": null,
    // "location": null,
    // "eventDate": null,
    // "awardDetail": null,
    // "tagList": [],
    // "createdAt": "2023-03-01T18:00:00.000Z",
    // "updatedAt": "2023-03-01T18:00:00.000Z",
    // "parentInsightId": null,
    // "parentInsight": null
    
    @Post(':id/repost')
@UseGuards(AuthGuard) // Must be logged in to repost
async repost(
    @User('id') currentUserId: number,
    @Param('id') insightId: string,
    @Body('body') dto?: RepostDto// Optional commentary string
) {
    return await this.insightService.repostInsight(currentUserId, insightId, dto?.body)
  }
}
