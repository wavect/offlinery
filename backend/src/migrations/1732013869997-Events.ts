import { MigrationInterface, QueryRunner } from "typeorm";

export class Events1732013869997 implements MigrationInterface {
    name = "Events1732013869997";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."multilingual_string_language_enum" AS ENUM('en', 'de')`,
        );
        await queryRunner.query(
            `CREATE TABLE "multilingual_string" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "language" "public"."multilingual_string_language_enum" NOT NULL, "text" character varying NOT NULL, "parentEntityId" uuid NOT NULL, "parentEntityType" character varying NOT NULL, "fieldName" character varying NOT NULL, CONSTRAINT "UQ_6edb943dcaf5aaf81ea88d44670" UNIQUE ("language", "parentEntityId", "parentEntityType", "fieldName"), CONSTRAINT "PK_d2d955a56edc0415439b91d9fe1" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_c07b16e231138d9fac3f6d3869" ON "multilingual_string" ("language", "parentEntityType", "fieldName") `,
        );
        await queryRunner.query(
            `CREATE TABLE "translatable_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "entityType" character varying NOT NULL, "startDateTime" TIMESTAMP, "endDateTime" TIMESTAMP, CONSTRAINT "UQ_523cb7ec3453b0051cbf884046d" UNIQUE ("id", "entityType"), CONSTRAINT "PK_1bf20fe29066ec15d1f47b51e41" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_83f93c47e414fed14e471e2015" ON "translatable_entity" ("entityType") `,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "message" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "message" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "encounter" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_feedback" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "pending_user" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "api_user" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP CONSTRAINT "PK_8dcf006c361abf2281f9e6d95ad"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP COLUMN "id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD CONSTRAINT "PK_8dcf006c361abf2281f9e6d95ad" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP CONSTRAINT "PK_58c08f0e20fa66561b119421eb2"`,
        );
        await queryRunner.query(`ALTER TABLE "user_report" DROP COLUMN "id"`);
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD CONSTRAINT "PK_58c08f0e20fa66561b119421eb2" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "multilingual_string" ADD CONSTRAINT "FK_ba10fe8c959dc37ed53aa90ec90" FOREIGN KEY ("parentEntityId", "parentEntityType") REFERENCES "translatable_entity"("id","entityType") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "multilingual_string" DROP CONSTRAINT "FK_ba10fe8c959dc37ed53aa90ec90"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP CONSTRAINT "PK_58c08f0e20fa66561b119421eb2"`,
        );
        await queryRunner.query(`ALTER TABLE "user_report" DROP COLUMN "id"`);
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD "id" SERIAL NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD CONSTRAINT "PK_58c08f0e20fa66561b119421eb2" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP CONSTRAINT "PK_8dcf006c361abf2281f9e6d95ad"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP COLUMN "id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD "id" SERIAL NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD CONSTRAINT "PK_8dcf006c361abf2281f9e6d95ad" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(`ALTER TABLE "api_user" DROP COLUMN "updated"`);
        await queryRunner.query(
            `ALTER TABLE "pending_user" DROP COLUMN "updated"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_feedback" DROP COLUMN "updated"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP COLUMN "updated"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP COLUMN "created"`,
        );
        await queryRunner.query(
            `ALTER TABLE "encounter" DROP COLUMN "updated"`,
        );
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated"`);
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP COLUMN "updated"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP COLUMN "created"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_83f93c47e414fed14e471e2015"`,
        );
        await queryRunner.query(`DROP TABLE "translatable_entity"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_c07b16e231138d9fac3f6d3869"`,
        );
        await queryRunner.query(`DROP TABLE "multilingual_string"`);
        await queryRunner.query(
            `DROP TYPE "public"."multilingual_string_language_enum"`,
        );
    }
}
