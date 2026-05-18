import { IsEnum, IsNotEmpty, IsString, IsOptional, IsDateString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { InsightType } from '@app/Insights/types/insight.type';

export class CreateInsightDto {
    @IsNotEmpty()
    @IsEnum(InsightType)
    type!: InsightType;

    @IsNotEmpty()
    @IsString()
    @MinLength(5, { message: 'Title is too short' })
    @MaxLength(100)
    title!: string;

    @IsNotEmpty({ message: 'Description is required for all posts to keep the feed informative.' })
    @IsString()
    @MinLength(10, { message: 'Please write at least 10 characters of content.' })
    content!: string;
    @IsOptional()
    tagList!: string[]; // Optional array of tags for categorization

    // --- TYPE-SPECIFIC CONDITIONAL VALIDATIONS ---

    // Location is MANDATORY only for Events
    @ValidateIf(o => o.type === InsightType.EVENT)
    @IsNotEmpty({ message: 'Location is required for campus events.' })
    @IsString()
    location?: string;

    // Event Date is MANDATORY only for Events
    @ValidateIf(o => o.type === InsightType.EVENT)
    @IsNotEmpty({ message: 'Event date and time are required for events.' })
    @IsDateString({ strict: true }, { message: 'Event date must be a valid ISO date string.' })
    eventDate?: string;

    // Award Detail is MANDATORY only for Achievements
    @ValidateIf(o => o.type === InsightType.ACHIEVEMENT)
    @IsNotEmpty({ message: 'Please specify the awarding body or rank achieved.' })
    @IsString()
    awardDetail?: string;
}