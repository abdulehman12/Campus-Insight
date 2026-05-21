import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../User/user.entity";
import { FollowUserEntity } from "./followUser.entity";
import { ProfileType } from "./types/profile.type";
import { ProfileResponseInterface } from "./types/profile.interface";
@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowUserEntity)
        private readonly followUserRepository: Repository<FollowUserEntity>
    ) { }

    async getProfile(userId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
        where: { username },
        relations: ['followerRelations', 'followingRelations', 'insights']
    });
    if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if the logged-in user actually follows this profile
    const isFollowing = await this.followUserRepository.findOne({
        where: { followerId: userId, followingId: user.id }
    });

    const followersCount = user.followerRelations?.length || 0;
    const followingCount = user.followingRelations?.length || 0;

    return {
        ...user,
        followersCount,
        followingCount,
        following: !!isFollowing, // true only if a follow record exists
    };
}

    async followUser(currentUserId: number, targetUsername: string): Promise<ProfileType> {
        // 1. Find the target user
        const targetUser = await this.userRepository.findOne({
            where: { username: targetUsername },
            relations: ['followerRelations', 'followingRelations'] // Ensure these are loaded for counts
        });

        if (!targetUser) {
            throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);
        }

        if (currentUserId === targetUser.id) {
            throw new HttpException('You cannot follow yourself', HttpStatus.BAD_REQUEST);
        }

        // 2. Check for existing follow
        const existingFollow = await this.followUserRepository.findOne({
            where: { followerId: currentUserId, followingId: targetUser.id }
        });
        if (existingFollow) {
            throw new HttpException('You are already following this user', HttpStatus.BAD_REQUEST);
        }

        // 3. Save the new follow relationship
        const follow = this.followUserRepository.create({
            followerId: currentUserId,
            followingId: targetUser.id
        });
        await this.followUserRepository.save(follow);

        // 4. Update the current user's following column flag in the DB
        await this.userRepository.update(currentUserId, { following: true });

        // 5. Fetch a FRESH copy of the target user so counts/states are perfectly accurate
        const updatedTargetUser = await this.userRepository.findOne({
            where: { id: targetUser.id },
            relations: ['followerRelations', 'followingRelations']
        });

        const followersCount = updatedTargetUser?.followerRelations?.length || 0;
        const followingCount = updatedTargetUser?.followingRelations?.length || 0;

        return {
            ...updatedTargetUser,
            following: true, // Manually forcing it true here ensures your API response is immediate
            followersCount,
            followingCount
        } as ProfileType;
    }

    async unfollowUser(currentUserId: number, targetUsername: string): Promise<ProfileType> {
        const targetUser = await this.userRepository.findOne({ where: { username: targetUsername } });
        if (!targetUser) {
            throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);
        }
        const existingFollow = await this.followUserRepository.findOne({
            where: { followerId: currentUserId, followingId: targetUser.id }
        });
        if (!existingFollow) {
            throw new HttpException('You are not following this user', HttpStatus.BAD_REQUEST);
        }
        await this.followUserRepository.remove(existingFollow);
        await this.userRepository.update(currentUserId, { following: false });

        const updatedTargetUser = await this.userRepository.findOne({
            where: { id: targetUser.id },
            relations: ['followerRelations', 'followingRelations']
        });

        const followersCount = updatedTargetUser?.followerRelations?.length || 0;
        const followingCount = updatedTargetUser?.followingRelations?.length || 0;
        return {
            ...updatedTargetUser,
            following: false, // Manually forcing it false here ensures your API response is immediate
            followersCount,
            followingCount
        } as ProfileType;
    }

    buildProfileResponse(user: ProfileType): ProfileResponseInterface {

        return {
            profile: {
                username: user.username,
                bio: user.bio,
                image: user.image,
                role: user.role,
                unit: user.unit,
                email: user.email,
                roll_no: user.roll_no,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
                following: user.following,
                insights: user.insights,
            }
        };
    }



}


