import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInsightComment1779578000939 implements MigrationInterface {
    name = 'CreateInsightComment1779578000939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insight_comments" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "insight_comments" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insight_comments" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "insight_comments" ALTER COLUMN "createdAt" DROP DEFAULT`);
    }

}
