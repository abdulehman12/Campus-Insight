import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, Length, minDate } from "class-validator";

    
    
    export class CreateUserDto {
        @IsNotEmpty()
        readonly username!: string;

        @IsNotEmpty()
        @IsEmail()
        readonly email!: string;

        @IsNotEmpty()
        readonly password!: string;

        @IsNotEmpty()
        @IsNumberString()
        @Length(11)
        readonly mobile_no!: string

        @IsNotEmpty()
        readonly unit!: string

        @IsNotEmpty()
        @IsNumber()
        @Type(() => Number)
        readonly roll_no!: number

        @IsNotEmpty()
        @IsNumber()
        @Type(() => Number)
        readonly start_date!: number

        @IsNotEmpty()
        @IsNumber()
        @Type(() => Number)
        readonly end_date!: number


    }