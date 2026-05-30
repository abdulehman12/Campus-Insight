import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RepostDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
    body!: string 
}