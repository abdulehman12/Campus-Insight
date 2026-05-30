// insight-like.entity.ts
import { UserEntity } from '@app/User/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import {InsightEntity} from '@app/Insights/entities/insight.entity'


@Entity('insight_likes')
@Unique(['userId', 'insightId']) // Prevents duplicate likes at the database layer
export class InsightLike {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    insightId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user!: UserEntity;

    @ManyToOne(() => InsightEntity, { onDelete: 'CASCADE' })
    insight!: InsightEntity;
}