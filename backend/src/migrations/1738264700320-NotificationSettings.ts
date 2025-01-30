import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationSettings1738264700320 implements MigrationInterface {
    name = "NotificationSettings1738264700320";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "ghostModeRemindersEmail" boolean NOT NULL DEFAULT true`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "eventAnnouncementsEmail" boolean NOT NULL DEFAULT true`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "eventAnnouncementsEmail"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "ghostModeRemindersEmail"`,
        );
    }
}
