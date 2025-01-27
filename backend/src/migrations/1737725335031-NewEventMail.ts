import { MigrationInterface, QueryRunner } from "typeorm";

export class NewEventMail1737725335031 implements MigrationInterface {
    name = "NewEventMail1737725335031";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "startDateTime"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "endDateTime"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "eventStartDateTime" TIMESTAMP`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "eventEndDateTime" TIMESTAMP`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "mapsLink" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "mapsLink"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "eventEndDateTime"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "eventStartDateTime"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "endDateTime" TIMESTAMP`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "startDateTime" TIMESTAMP`,
        );
    }
}
