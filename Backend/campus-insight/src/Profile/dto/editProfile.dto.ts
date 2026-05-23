// edit-profile.dto.ts
import { IsString, IsOptional, IsEmail, Length, IsNumber, IsEnum } from 'class-validator';

export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher'
}

export class EditProfileDto {
    @IsOptional()
    @IsString()
    @Length(3, 20)
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsNumber()
    roll_no?: number;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Role must be either student or teacher' })
    role?: UserRole;
}