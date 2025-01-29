import { MigrationInterface, QueryRunner } from "typeorm";

export class EventEntityMap1738190126499 implements MigrationInterface {
    name = "EventEntityMap1738190126499";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" ADD "location" geography(Point,4326)`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_643c345f3e874006834b68ef60" ON "translatable_entity" USING GiST ("location") `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_643c345f3e874006834b68ef60"`,
        );
        await queryRunner.query(
            `ALTER TABLE "translatable_entity" DROP COLUMN "location"`,
        );
    }
}
