import { MigrationInterface, QueryRunner } from "typeorm";

export class ShareAddedtoInsights1779658447181 implements MigrationInterface {
    name = 'ShareAddedtoInsights1779658447181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insights" ADD "parentInsightId" uuid`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "content" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "insights" ADD CONSTRAINT "FK_64de5f4a363211b8ba0c2e54928" FOREIGN KEY ("parentInsightId") REFERENCES "insights"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insights" DROP CONSTRAINT "FK_64de5f4a363211b8ba0c2e54928"`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "content" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "insights" DROP COLUMN "parentInsightId"`);
    }

}
