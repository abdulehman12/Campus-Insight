import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "@app/User/user.entity";
@Entity({
    name: 'follow_users'
})

export class FollowUserEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    followerId!: number;

    @Column()
    followingId!: number;

    @ManyToOne(() => UserEntity, (user) => user.followingRelations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId' })
    follower!: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.followerRelations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followingId' })
    following!: UserEntity;
}