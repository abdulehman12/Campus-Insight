import { IsEnum, IsOptional, IsInt, IsDateString, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { InsightType } from '@app/Insights/types/insight.type';

export class GetInsightsQueryDto {
  @IsOptional()
  @IsEnum(InsightType)
  type?: InsightType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(50)
  limit?: number = 10; // Default load size per scroll block

  @IsOptional()
  @IsDateString()
  cursor?: string; // This will hold the 'createdAt' timestamp of the last loaded post

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorId?: number;

  @IsOptional()
  @IsString()
  tag?: string; // Optional tag filter for insights
}