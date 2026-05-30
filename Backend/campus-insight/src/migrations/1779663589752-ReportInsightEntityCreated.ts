import { MigrationInterface, QueryRunner } from "typeorm";

export class ReportInsightEntityCreated1779663589752 implements MigrationInterface {
    name = 'ReportInsightEntityCreated1779663589752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "insight_reports" ("id" SERIAL NOT NULL, "insightId" uuid NOT NULL, "reporterId" integer NOT NULL, "reason" character varying(150) NOT NULL, "additionalDetails" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a72be20d6ad850951477a3d4d21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "insight_reports" ADD CONSTRAINT "FK_d1621fc020a2383ef57243e4bfd" FOREIGN KEY ("insightId") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "insight_reports" ADD CONSTRAINT "FK_e640fee6e842f71d41195000aa9" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insight_reports" DROP CONSTRAINT "FK_e640fee6e842f71d41195000aa9"`);
        await queryRunner.query(`ALTER TABLE "insight_reports" DROP CONSTRAINT "FK_d1621fc020a2383ef57243e4bfd"`);
        await queryRunner.query(`DROP TABLE "insight_reports"`);
    }

}
