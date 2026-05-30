import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInsightLike1779571481427 implements MigrationInterface {
    name = 'CreateInsightLike1779571481427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "insight_likes" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "insightId" uuid NOT NULL, CONSTRAINT "UQ_ebc8072a6ceed89c62ea861d7e0" UNIQUE ("userId", "insightId"), CONSTRAINT "PK_08bb3a414012a4f77fc8cc20ce4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "insight_likes" ADD CONSTRAINT "FK_10bdca2ca4742070389e40ceaa5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "insight_likes" ADD CONSTRAINT "FK_937ab2662d0cf1021bdde773bd7" FOREIGN KEY ("insightId") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insight_likes" DROP CONSTRAINT "FK_937ab2662d0cf1021bdde773bd7"`);
        await queryRunner.query(`ALTER TABLE "insight_likes" DROP CONSTRAINT "FK_10bdca2ca4742070389e40ceaa5"`);
        await queryRunner.query(`DROP TABLE "insight_likes"`);
    }

}
