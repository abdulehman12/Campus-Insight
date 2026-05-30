import { MigrationInterface, QueryRunner } from "typeorm";

export class Afieldadded1779657556023 implements MigrationInterface {
    name = 'Afieldadded1779657556023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insight_comments" DROP CONSTRAINT "FK_5d2f4e7661fe4210082d014c213"`);
        await queryRunner.query(`ALTER TABLE "insight_comments" DROP COLUMN "authorId"`);
        await queryRunner.query(`ALTER TABLE "insight_comments" ADD CONSTRAINT "FK_e183888ced160607efc6596ab73" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insight_comments" DROP CONSTRAINT "FK_e183888ced160607efc6596ab73"`);
        await queryRunner.query(`ALTER TABLE "insight_comments" ADD "authorId" integer`);
        await queryRunner.query(`ALTER TABLE "insight_comments" ADD CONSTRAINT "FK_5d2f4e7661fe4210082d014c213" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
