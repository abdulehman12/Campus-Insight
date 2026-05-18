import { Body, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { InsightService } from "./insight.service";
import { AuthGuard } from "@app/User/guards/auth.guard";
import { CreateInsightDto } from "./types/insight.dto";
import { FileInterceptor } from "@nestjs/platform-express/multer/interceptors/file.interceptor";
import { diskStorage } from "multer";
import { extname } from "path";
import type { Multer } from "multer";
import { User } from "@app/User/decorators/user.decorator";
import { GetInsightsQueryDto } from "./types/getInsight.dto";

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
    async createInsight(@User('id') userId:number, @Body() createInsightDto: CreateInsightDto, @UploadedFile() file: Multer.File): Promise<any> {
        return this.insightService.createInsight(createInsightDto, file, userId);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getAllInsights(@Query() query: GetInsightsQueryDto): Promise<any> {
        return this.insightService.getAllInsights(query);
    }
}