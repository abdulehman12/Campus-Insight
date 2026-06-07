import { UserEntity } from "@app/User/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";
import { InsightType } from "../types/insight.type";
import { InsightLike } from "@app/Insights/entities/Insight_like.entity";
import { InsightComment } from "@app/Insights/entities/insight_comment.entity";

@Entity({
    name: "insights"
})
export class InsightEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'enum', enum: InsightType, default: InsightType.TEXT })
    type!: InsightType;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    // FIX: Made nullable so users can do a pure repost without adding text commentary
    @Column({ type: 'text', nullable: true })
    content!: string | null;

    @Column({ type: 'varchar', nullable: true })
    mediaUrl!: string;

    @Column({ type: 'varchar', nullable: true })
    location!: string;

    @Column({ type: 'timestamp', nullable: true })
    eventDate!: Date;

    @Column({ type: 'varchar', nullable: true })
    awardDetail!: string;

@Column('text', { array: true, default: '{}' })
    tagList!: string[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // --- REPOST SELF-REFERENCING RELATIONSHIP ---
    @Column({ type: 'uuid', nullable: true })
    parentInsightId!: string | null;

    @ManyToOne(() => InsightEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'parentInsightId' })
    parentInsight!: InsightEntity | null;
    // --------------------------------------------

    // User Relationships
    @ManyToOne(() => UserEntity, (user) => user.insights, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authorId' }) // Enforces explicit mapping to your authorId column
    author!: UserEntity;

    @Column()
    authorId!: number;

    // Action Relationships
    @OneToMany(() => InsightLike, (insightLike) => insightLike.insight)
    likes!: InsightLike[];

    @OneToMany(() => InsightComment, (comment) => comment.insight)
    comments!: InsightComment[];

    @OneToMany(() => InsightEntity, (insight) => insight.parentInsight)
    reposts!: InsightEntity[];

    @BeforeInsert()
    updateTimestamps() {
        this.updatedAt = new Date();
    }
}