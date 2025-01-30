import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { MigrationInterface, QueryRunner } from "typeorm";

export class RestrictedView1738241266584 implements MigrationInterface {
    name = "RestrictedView1738241266584";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First add the column as nullable
        await queryRunner.query(
            `ALTER TABLE "user" ADD "restrictedViewToken" character varying`,
        );

        // Get all existing users
        const users = await queryRunner.query(`SELECT id FROM "user"`);

        // Generate and update random hash for each user
        for (const user of users) {
            const random = randomBytes(32).toString("hex");
            const salt = await bcrypt.genSalt(3);
            // @dev Hash used as clearText token
            const token = await bcrypt.hash(random, salt);

            await queryRunner.query(
                `UPDATE "user" SET "restrictedViewToken" = $1 WHERE id = $2`,
                [token, user.id],
            );
        }

        // Now make the column NOT NULL after all values are set
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "restrictedViewToken" SET NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "restrictedViewToken"`,
        );
    }
}
