import { MigrationInterface, QueryRunner } from "typeorm";

export class EventKey1738184967320 implements MigrationInterface {
    name = "EventKey1738184967320";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "eventKey" character varying`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD CONSTRAINT "UQ_678d2f506dab1684c76207bac3e" UNIQUE ("eventKey")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP CONSTRAINT "UQ_678d2f506dab1684c76207bac3e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "eventKey"`,
        );
    }
}
