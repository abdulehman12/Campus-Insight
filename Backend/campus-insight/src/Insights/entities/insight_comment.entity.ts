// insights/entities/insight-comment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm'; // Added JoinColumn
import { InsightEntity } from './insight.entity';
import { UserEntity } from '@app/User/user.entity';

@Entity('insight_comments')
export class InsightComment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    body!: string;

    @Column()
    userId!: number;

    @Column()
    insightId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Relationships
    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' }) //  THIS IS THE MAGIC LINK
    author!: UserEntity;

    @ManyToOne(() => InsightEntity, (insight) => insight.comments, { onDelete: 'CASCADE' })
    insight!: InsightEntity;
}