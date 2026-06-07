import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import type { Multer } from "multer";
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from "./dto/userLogin.dto";
import { sign } from "jsonwebtoken";
import { UserResponseInterface } from "./types/userResonse.interface";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@app/types/userRole.type";
import { VerifyUserDto } from "./dto/verify.dto";
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly configService: ConfigService
    ) {}

    async registerUser(createUserDto: CreateUserDto, file: Multer.File): Promise<any> {
        // Implement user registration logic here

        const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        
        const userByEmail = await this.userRepository.findOne({
            where: {email: createUserDto.email}
        });
        const userByUsername = await this.userRepository.findOne({
            where: {username: createUserDto.username}
        });
        if(userByEmail || userByUsername) {
            throw new HttpException('Email or username already exists', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const UserData = {
            ...createUserDto,
            image: file ? file.filename : "default.png",
            otpCode: generateOtp,
            isVerified: false
        }
        const newUser = new UserEntity();
        Object.assign(newUser, UserData);
        const savedUser = await this.userRepository.save(newUser);
        return {
            message: "Registration submitted. Please collect your OTP from the Admin.",
            registrationId: savedUser.roll_no
        }
    }

    async loginAdmin(userLoginDto: UserLoginDto): Promise<any> {
    const masterEmail = this.configService.get<string>('ADMIN_EMAIL');
    const masterPass = this.configService.get<string>('ADMIN_PASSWORD');
        if(!masterEmail || !masterPass) {
            throw new HttpException('Admin credentials not configured', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    if(!(userLoginDto.email === masterEmail)){
        throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND);
    }
    if(!(userLoginDto.password === masterPass)){
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const adminUser = {
        id: 0,
        username: 'admin',  
        email: masterEmail,
        role: UserRole.ADMIN
    }
    return adminUser;

} 

    async loginUser(userLoginDto: UserLoginDto): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email: userLoginDto.email }
        });

        if(!user?.isVerified){
            throw new HttpException('User not verified. Please contact the Admin.', HttpStatus.UNAUTHORIZED);
        }
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(userLoginDto.password, user.password);

        if(!isPasswordValid) {
            throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
        }
        // Remove password from the user object before returning
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as UserEntity;
    }

    async verifyUser(verifyUserDto: VerifyUserDto): Promise<any> {
        const { roll_no, otpCode } = verifyUserDto;
        const user = await this.userRepository.findOne({
            where: { roll_no }
        });
        console.log('Verifying user with roll_no:', roll_no, 'and otpCode:', otpCode); // Debugging line
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (user.otpCode !== otpCode) {
            throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
        }
        user.isVerified = true;
        user.otpCode = ''; // Clear OTP after successful verification
        await this.userRepository.save(user);
        return { message: 'User verified successfully' };
    }

    async findById(id: number): Promise<UserEntity| null> {
        return this.userRepository.findOne({where: {id}});
    }

    generateJwt(user: any): string {
        return sign({
            id: user.id,
            username: user.username,
            email: user.email,   
            role: user.role
    }, this.configService.get<string>('JWT_SECRET')!);
    
    }
    buildUserResponse(user: any): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user)
            }
        }
    }
}