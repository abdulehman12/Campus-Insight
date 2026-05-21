import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowingAdded1779273429587 implements MigrationInterface {
    name = 'FollowingAdded1779273429587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "following" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "following"`);
    }

}
