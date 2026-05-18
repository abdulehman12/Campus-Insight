import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInsightsTable1778984608671 implements MigrationInterface {
    name = 'CreateInsightsTable1778984608671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."insights_type_enum" AS ENUM('text', 'image', 'video', 'event', 'announcement', 'achievement')`);
        await queryRunner.query(`CREATE TABLE "insights" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."insights_type_enum" NOT NULL DEFAULT 'text', "title" character varying(255) NOT NULL, "content" text NOT NULL, "mediaUrl" character varying, "location" character varying, "eventDate" TIMESTAMP, "awardDetail" character varying, "tagList" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer NOT NULL, CONSTRAINT "PK_8616ab29fa49b7942541b8c964a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "insights" ADD CONSTRAINT "FK_45d2f3219471f150535982fa83c" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insights" DROP CONSTRAINT "FK_45d2f3219471f150535982fa83c"`);
        await queryRunner.query(`DROP TABLE "insights"`);
        await queryRunner.query(`DROP TYPE "public"."insights_type_enum"`);
    }

}
