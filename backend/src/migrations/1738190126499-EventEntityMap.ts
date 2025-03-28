import { MigrationInterface, QueryRunner } from "typeorm";

export class EventEntityMap1738190126499 implements MigrationInterface {
    name = "EventEntityMap1738190126499";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasColumn = await queryRunner.hasColumn(
            "translatable_entity",
            "location",
        );
        if (!hasColumn) {
            await queryRunner.query(
                `ALTER TABLE "translatable_entity" ADD "location" geography(Point,4326)`,
            );
        }

        // Create index if it doesn't exist
        const hasIndex = await queryRunner.query(
            `SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE indexname = 'IDX_643c345f3e874006834b68ef60'
        )`,
        );
        if (!hasIndex[0].exists) {
            await queryRunner.query(
                `CREATE INDEX "IDX_643c345f3e874006834b68ef60" ON "translatable_entity" USING GiST ("location") `,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index if exists
        await queryRunner.query(
            `DROP INDEX IF EXISTS "public"."IDX_643c345f3e874006834b68ef60"`,
        );

        // Drop column if exists
        const hasColumn = await queryRunner.hasColumn(
            "translatable_entity",
            "location",
        );
        if (hasColumn) {
            await queryRunner.query(
                `ALTER TABLE "translatable_entity" DROP COLUMN "location"`,
            );
        }
    }
}
