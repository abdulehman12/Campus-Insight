import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFollowUserEntity1779098327553 implements MigrationInterface {
    name = 'CreateFollowUserEntity1779098327553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follow_users" ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_3bf459ba2d896d9dcc0d389666b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "follow_users" ADD CONSTRAINT "FK_e63ddc49fc80f5653066e49efee" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow_users" ADD CONSTRAINT "FK_a9b6cb8ad2cf8d7788c36c73754" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow_users" DROP CONSTRAINT "FK_a9b6cb8ad2cf8d7788c36c73754"`);
        await queryRunner.query(`ALTER TABLE "follow_users" DROP CONSTRAINT "FK_e63ddc49fc80f5653066e49efee"`);
        await queryRunner.query(`DROP TABLE "follow_users"`);
    }

}
