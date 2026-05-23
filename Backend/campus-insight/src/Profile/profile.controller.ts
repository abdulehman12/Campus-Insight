import { Controller, Delete, Get, Param, Post, Put, Body, UsePipes, ValidationPipe} from "@nestjs/common";
import { Profile } from "passport";
import { ProfileService } from "./profile.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@app/User/guards/auth.guard";
import { User } from "@app/User/decorators/user.decorator";
import { ProfileResponseInterface } from "./types/profile.interface";
import { EditProfileDto } from "./dto/editProfile.dto";
@Controller("profile")
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
    ) {}

    @Get(':username')
    @UseGuards(AuthGuard)
    async getProfile(@User('id') userId:number, @Param('username') username:string): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.getProfile(userId, username);
        return this.profileService.buildProfileResponse(profile);
    }

    @Post('follow/:username')
    @UseGuards(AuthGuard)
    async followUser(@User('id') currentUserId:number, @Param('username') targetUsername:string): Promise<ProfileResponseInterface> {
        const follow = await this.profileService.followUser(currentUserId, targetUsername);
        return this.profileService.buildProfileResponse(follow);

    }

    @Delete('unfollow/:username')
    @UseGuards(AuthGuard)
    async unfollowUser(@User('id') currentUserId:number, @Param('username') targetUsername:string): Promise<ProfileResponseInterface> {
        const unfollow = await this.profileService.unfollowUser(currentUserId, targetUsername);
        return this.profileService.buildProfileResponse(unfollow);
    }

    @Put('edit-profile')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async editProfile(@User('id') userId:number, @Body() editProfileDto: EditProfileDto): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.editProfile(userId, editProfileDto);
        return this.profileService.buildProfileResponse(profile);
    }

}