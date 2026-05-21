import { MigrationInterface, QueryRunner } from "typeorm";

export class SportsAdded1779183730183 implements MigrationInterface {
    name = 'SportsAdded1779183730183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."insights_type_enum" RENAME TO "insights_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."insights_type_enum" AS ENUM('text', 'image', 'video', 'event', 'announcement', 'achievement', 'sports')`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "type" TYPE "public"."insights_type_enum" USING "type"::"text"::"public"."insights_type_enum"`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "type" SET DEFAULT 'text'`);
        await queryRunner.query(`DROP TYPE "public"."insights_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."insights_type_enum_old" AS ENUM('text', 'image', 'video', 'event', 'announcement', 'achievement')`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "type" TYPE "public"."insights_type_enum_old" USING "type"::"text"::"public"."insights_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "insights" ALTER COLUMN "type" SET DEFAULT 'text'`);
        await queryRunner.query(`DROP TYPE "public"."insights_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."insights_type_enum_old" RENAME TO "insights_type_enum"`);
    }

}
