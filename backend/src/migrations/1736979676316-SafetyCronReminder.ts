import { MigrationInterface, QueryRunner } from "typeorm";

export class SafetyCronReminder1736979676316 implements MigrationInterface {
    name = "SafetyCronReminder1736979676316";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "lastSafetyCallVerificationReminderSent" TIMESTAMP WITH TIME ZONE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "lastSafetyCallVerificationReminderSent"`,
        );
    }
}
