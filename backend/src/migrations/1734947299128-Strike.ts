import { MigrationInterface, QueryRunner } from "typeorm";

export class Strike1734947299128 implements MigrationInterface {
    name = "Strike1734947299128";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "encounter" ADD "streakCounter" integer NOT NULL DEFAULT '1'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "encounter" DROP COLUMN "streakCounter"`,
        );
    }
}
