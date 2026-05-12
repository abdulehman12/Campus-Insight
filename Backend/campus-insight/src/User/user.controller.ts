import { Controller, Get, UsePipes, Body, Post, UseInterceptors, UploadedFile, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { FileInterceptor, NoFilesInterceptor } from "@nestjs/platform-express";
import type { Multer } from "multer";
import { diskStorage } from "multer";
import { extname } from "path";
import { UserLoginDto } from "./dto/userLogin.dto";
import { UserResponseInterface } from "./types/userResonse.interface";
import { In } from "typeorm";
import { VerifyUserDto } from "./dto/verify.dto";
import { AuthGuard } from "./guards/auth.guard";
import { User } from "./decorators/user.decorator";
@Controller('/users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('image',{
  storage: diskStorage({
    destination: './uploads/profiles',
    filename: (req, file, cb) => {
      const name = Date.now() + extname(file.originalname);
      cb(null, name);
    },
  }),
}))
    @UsePipes(new ValidationPipe())
    async registerUser(@UploadedFile() file: Multer.File, @Body() createUserDto: CreateUserDto) {
        return await this.userService.registerUser(createUserDto, file);
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async loginUser(@Body("user") userLoginDto: UserLoginDto): Promise<UserResponseInterface> {
       const loggedUser = await this.userService.loginUser(userLoginDto);
       return this.userService.buildUserResponse(loggedUser);
    }

    @Post('verify')
    async verifyUser(@Body('verify_data') verifyUserDto: VerifyUserDto): Promise<any> {
      console.log(verifyUserDto);
        return await this.userService.verifyUser(verifyUserDto);
    }

    @Post('admin/login')
    @UsePipes(new ValidationPipe())
  async loginAdmin(@Body("user") UserLoginDto: UserLoginDto):Promise<UserResponseInterface>{
    const admin = await this.userService.loginAdmin(UserLoginDto);
    return this.userService.buildUserResponse(admin);
  }

  @Get('current_user')
  @UseGuards(AuthGuard)
  async getCurrentUser(@User() user: any): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }


}