// insights/entities/insight-report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InsightEntity } from './insight.entity';
import { UserEntity } from '@app/User/user.entity';

@Entity('insight_reports')
export class InsightReportEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    insightId!: string;

    @Column()
    reporterId!: number;

    @Column({ type: 'varchar', length: 150 })
    reason!: string; // e.g., "Spam", "Harassment", "Inappropriate Content"

    @Column({ type: 'text', nullable: true })
    additionalDetails!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    // Relationships
    @ManyToOne(() => InsightEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'insightId' })
    insight!: InsightEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reporterId' })
    reporter!: UserEntity;
}