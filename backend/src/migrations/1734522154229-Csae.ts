import { MigrationInterface, QueryRunner } from "typeorm";

export class Csae1734522154229 implements MigrationInterface {
    name = "Csae1734522154229";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "public"."user_report_incidenttype_enum" RENAME TO "user_report_incidenttype_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_report_incidenttype_enum" AS ENUM('Disrespectful', 'Child Sexual Abuse', 'Sexual harassment', 'Violent behavior', 'Other')`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ALTER COLUMN "incidentType" TYPE "public"."user_report_incidenttype_enum" USING "incidentType"::"text"::"public"."user_report_incidenttype_enum"`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."user_report_incidenttype_enum_old"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."user_report_incidenttype_enum_old" AS ENUM('Disrespectful', 'Sexual harassment', 'Violent behavior', 'Other')`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ALTER COLUMN "incidentType" TYPE "public"."user_report_incidenttype_enum_old" USING "incidentType"::"text"::"public"."user_report_incidenttype_enum_old"`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."user_report_incidenttype_enum"`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."user_report_incidenttype_enum_old" RENAME TO "user_report_incidenttype_enum"`,
        );
    }
}
