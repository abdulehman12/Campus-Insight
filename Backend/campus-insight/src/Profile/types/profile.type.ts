import { UserEntity } from "@app/User/user.entity";

export type ProfileType = Omit<
  UserEntity, 
  'password' | 'otpCode' | 'hashPassword'
> & {
  followersCount: number;
  followingCount: number;
};