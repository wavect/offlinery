import { MigrationInterface, QueryRunner } from "typeorm";

export class EntityCreationTimestamp1730292489390
    implements MigrationInterface
{
    name = "EntityCreationTimestamp1730292489390";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "api_user" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "pending_user" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_feedback" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user_feedback" DROP COLUMN "created"`,
        );
        await queryRunner.query(
            `ALTER TABLE "pending_user" DROP COLUMN "created"`,
        );
        await queryRunner.query(`ALTER TABLE "api_user" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created"`);
    }
}
