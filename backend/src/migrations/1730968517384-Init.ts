import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1730968517384 implements MigrationInterface {
    name = "Init1730968517384";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "blacklisted_region" ("id" SERIAL NOT NULL, "location" geography(Point,4326) NOT NULL, "radius" double precision NOT NULL, "userId" uuid, CONSTRAINT "PK_8dcf006c361abf2281f9e6d95ad" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_04d9d3ffd483c46b1fe80334a7" ON "blacklisted_region" USING GiST ("location") `,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_genderdesire_enum" AS ENUM('woman', 'man')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_intentions_enum" AS ENUM('friendship', 'casual', 'relationship')`,
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "firstName" character varying NOT NULL, "wantsEmailUpdates" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "passwordSalt" character varying NOT NULL, "birthDay" date NOT NULL, "gender" character varying NOT NULL, "genderDesire" "public"."user_genderdesire_enum" array NOT NULL, "intentions" "public"."user_intentions_enum" array NOT NULL, "ageRangeString" int4range NOT NULL, "imageURIs" text array, "verificationStatus" character varying NOT NULL, "approachChoice" character varying NOT NULL, "approachFromTime" TIMESTAMP WITH TIME ZONE NOT NULL, "approachToTime" TIMESTAMP WITH TIME ZONE NOT NULL, "bio" character varying NOT NULL, "refreshToken" character varying, "refreshTokenExpires" TIMESTAMP, "dateMode" character varying NOT NULL, "pushToken" character varying, "trustScore" integer, "location" geography(Point,4326), "locationLastTimeUpdated" TIMESTAMP, "preferredLanguage" character varying, "resetPasswordCode" character varying, "resetPasswordCodeIssuedAt" TIMESTAMP WITH TIME ZONE, "deletionTokenExpires" TIMESTAMP, "deletionToken" character varying, "created" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_9daf063213c5d5de1bef150ced6" UNIQUE ("deletionToken"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_af7cabf8e064aa7bad09c731ba" ON "user" USING GiST ("location") `,
        );
        await queryRunner.query(
            `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "sentAt" TIMESTAMP WITH TIME ZONE NOT NULL, "senderId" uuid, "encounterId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."encounter_status_enum" AS ENUM('not_met', 'met_not_interested', 'met_interested')`,
        );
        await queryRunner.query(
            `CREATE TABLE "encounter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userStatuses" jsonb NOT NULL DEFAULT '{}', "lastDateTimePassedBy" TIMESTAMP WITH TIME ZONE NOT NULL, "lastLocationPassedBy" geography(Point,4326), "status" "public"."encounter_status_enum" NOT NULL DEFAULT 'not_met', CONSTRAINT "PK_1cf9e15e693ff9f0ef9b9061372" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_e2d9d1248a69aa5e2d557ab65e" ON "encounter" USING GiST ("lastLocationPassedBy") `,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_report_incidenttype_enum" AS ENUM('Disrespectful', 'Sexual harassment', 'Violent behavior', 'Other')`,
        );
        await queryRunner.query(
            `CREATE TABLE "user_report" ("id" SERIAL NOT NULL, "incidentDescription" text NOT NULL, "keepReporterInTheLoop" boolean NOT NULL, "incidentType" "public"."user_report_incidenttype_enum" NOT NULL, "reportedOn" TIMESTAMP NOT NULL DEFAULT now(), "reportedUserId" uuid, "reportingUserId" uuid, "reportedEncounterId" uuid, CONSTRAINT "PK_58c08f0e20fa66561b119421eb2" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "user_feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "feedbackText" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94fb2b9415a96bde222d5e40598" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "pending_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "verificationStatus" character varying NOT NULL, "verificationCode" character varying NOT NULL, "verificationCodeIssuedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "acceptedSpecialDataGenderLookingForAt" TIMESTAMP WITH TIME ZONE, "created" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_df7ff5a4672a3479c641cd67191" UNIQUE ("email"), CONSTRAINT "PK_ea2c9c5daf7f8339c58f5325734" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "api_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isAdmin" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, "apiKey" character varying NOT NULL, "apiSecretTokenHash" character varying NOT NULL, "apiSecretTokenSalt" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fffceda84bb725e711070e8f988" UNIQUE ("email"), CONSTRAINT "UQ_44b5c45640208e4e1183680befc" UNIQUE ("apiKey"), CONSTRAINT "UQ_be6c6a8d6b59aa6b2e4a8e8beef" UNIQUE ("apiSecretTokenHash"), CONSTRAINT "UQ_f68a3972ed572da2fbda5315a1b" UNIQUE ("apiSecretTokenSalt"), CONSTRAINT "PK_8eb953e69be312b10c2d8e060c4" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "user_encounters_encounter" ("userId" uuid NOT NULL, "encounterId" uuid NOT NULL, CONSTRAINT "PK_c4c9e99d7b96eb58751e728bfd0" PRIMARY KEY ("userId", "encounterId"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_296e4e94a4a79b6bfb10cbec7d" ON "user_encounters_encounter" ("userId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_3a825ac05eb80030f15bb5cdff" ON "user_encounters_encounter" ("encounterId") `,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" ADD CONSTRAINT "FK_f3cb6ca52969e33506f316db314" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "message" ADD CONSTRAINT "FK_bd2d3d466d3ed775a960c434724" FOREIGN KEY ("encounterId") REFERENCES "encounter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD CONSTRAINT "FK_2d3711064572aa0203cba01242b" FOREIGN KEY ("reportedUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD CONSTRAINT "FK_396e37c04a261e1954c4721c98a" FOREIGN KEY ("reportingUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" ADD CONSTRAINT "FK_c0f5154673d226ab08b822957d2" FOREIGN KEY ("reportedEncounterId") REFERENCES "encounter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_encounters_encounter" ADD CONSTRAINT "FK_296e4e94a4a79b6bfb10cbec7d0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_encounters_encounter" ADD CONSTRAINT "FK_3a825ac05eb80030f15bb5cdfff" FOREIGN KEY ("encounterId") REFERENCES "encounter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user_encounters_encounter" DROP CONSTRAINT "FK_3a825ac05eb80030f15bb5cdfff"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_encounters_encounter" DROP CONSTRAINT "FK_296e4e94a4a79b6bfb10cbec7d0"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP CONSTRAINT "FK_c0f5154673d226ab08b822957d2"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP CONSTRAINT "FK_396e37c04a261e1954c4721c98a"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_report" DROP CONSTRAINT "FK_2d3711064572aa0203cba01242b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "message" DROP CONSTRAINT "FK_bd2d3d466d3ed775a960c434724"`,
        );
        await queryRunner.query(
            `ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blacklisted_region" DROP CONSTRAINT "FK_f3cb6ca52969e33506f316db314"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_3a825ac05eb80030f15bb5cdff"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_296e4e94a4a79b6bfb10cbec7d"`,
        );
        await queryRunner.query(`DROP TABLE "user_encounters_encounter"`);
        await queryRunner.query(`DROP TABLE "api_user"`);
        await queryRunner.query(`DROP TABLE "pending_user"`);
        await queryRunner.query(`DROP TABLE "user_feedback"`);
        await queryRunner.query(`DROP TABLE "user_report"`);
        await queryRunner.query(
            `DROP TYPE "public"."user_report_incidenttype_enum"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_e2d9d1248a69aa5e2d557ab65e"`,
        );
        await queryRunner.query(`DROP TABLE "encounter"`);
        await queryRunner.query(`DROP TYPE "public"."encounter_status_enum"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_af7cabf8e064aa7bad09c731ba"`,
        );
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_intentions_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_genderdesire_enum"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_04d9d3ffd483c46b1fe80334a7"`,
        );
        await queryRunner.query(`DROP TABLE "blacklisted_region"`);
    }
}
