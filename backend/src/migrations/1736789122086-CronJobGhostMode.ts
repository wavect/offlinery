import { MigrationInterface, QueryRunner } from "typeorm";

export class CronJobGhostMode1736789122086 implements MigrationInterface {
    name = "CronJobGhostMode1736789122086";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "lastDateModeChange" TIMESTAMP WITH TIME ZONE`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "lastDateModeReminderSent" TIMESTAMP WITH TIME ZONE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "lastDateModeReminderSent"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "lastDateModeChange"`,
        );
    }
}
