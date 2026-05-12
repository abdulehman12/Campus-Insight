import { IsEmail, isEmail, IsNotEmpty, isNotEmpty } from "class-validator";

export class UserLoginDto {
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;
}