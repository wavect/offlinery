import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDateEncounter1731141280377 implements MigrationInterface {
    name = "CreateDateEncounter1731141280377";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "encounter" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "encounter" DROP COLUMN "created"`,
        );
    }
}
