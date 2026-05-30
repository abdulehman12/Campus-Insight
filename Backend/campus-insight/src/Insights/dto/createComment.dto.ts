// insights/dto/create-comment.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
    body!: string;
}