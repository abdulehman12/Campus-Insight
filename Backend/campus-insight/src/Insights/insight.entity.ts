import { UserEntity } from "@app/User/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";
import { InsightType } from "./types/insight.type";
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

    @Column({ type: 'text' })
    content!: string;

    // URL for images, videos, or achievement certificates
    @Column({ type: 'varchar', nullable: true })
    mediaUrl!: string;

    // Specific for Events: Location or Link
    @Column({ type: 'varchar', nullable: true })
    location!: string;

    // Specific for Events: Date and Time
    @Column({ type: 'timestamp', nullable: true })
    eventDate!: Date;

    // Specific for Achievements: The "Awarding Body" or "Rank"
    @Column({ type: 'varchar', nullable: true })
    awardDetail!: string;

    @Column('simple-array')
    tagList!: string[]; // Comma-separated tags for categorization

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // The Relationship
    @ManyToOne(() => UserEntity, (user) => user.insights, { onDelete: 'CASCADE' })
    author!: UserEntity;

    @Column()
    authorId!: number;

    @BeforeInsert()
    updateTimestamps() {
        this.updatedAt = new Date();
    }


}