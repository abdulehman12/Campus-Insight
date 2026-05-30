import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UserRole } from "@app/types/userRole.type";
import { InsightEntity } from "@app/Insights/entities/insight.entity";
import { FollowUserEntity } from "@app/Profile/followUser.entity";
import {InsightLike} from "@app/Insights/entities/Insight_like.entity"
@Entity({
    name: 'users'
})

export class UserEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    email!: string

    @Column()
    username!: string

    @Column()
    mobile_no!: string

    @Column()
    roll_no!: number

    @Column()
    unit!: string

    @Column({ default: '' })
    bio!: string

    @Column({ default: '' })
    image!: string

    @Column()
    password!: string

    @Column({ default: false })
    isVerified!: boolean;

    @Column({ nullable: true })
    otpCode!: string;



    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT
    })
    role!: UserRole;

    @OneToMany(() => InsightEntity, (insight) => insight.author)
    insights!: InsightEntity[];

    @OneToMany(() => FollowUserEntity, (follow) => follow.follower)
    followingRelations!: FollowUserEntity[];

    @OneToMany(() => FollowUserEntity, (follow) => follow.following)
    followerRelations!: FollowUserEntity[];

    @Column({default: false})
    following!: boolean

    @OneToMany(() => InsightLike, (insightLike) => insightLike.user)
    likedInsights!: InsightLike[];

    @BeforeInsert()
    async hashPassword() {
        // Hash the password before saving to the database
        this.password = await bcrypt.hash(this.password, 10);
    }


}