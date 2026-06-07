import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTagListDefault1780276832527 implements MigrationInterface {
    name = 'UpdateTagListDefault1780276832527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insights" DROP COLUMN "tagList"`);
        await queryRunner.query(`ALTER TABLE "insights" ADD "tagList" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insights" DROP COLUMN "tagList"`);
        await queryRunner.query(`ALTER TABLE "insights" ADD "tagList" text NOT NULL`);
    }

}
