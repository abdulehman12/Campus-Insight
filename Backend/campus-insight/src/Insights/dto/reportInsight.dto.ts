import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    reason!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    additionalDetails?: string;
} 