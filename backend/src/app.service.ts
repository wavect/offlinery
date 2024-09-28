import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AppService {
    constructor(private dataSource: DataSource) {}

    getUptime(): string {
        return `Application started ${process.uptime().toFixed(3)} seconds ago.`;
    }

    /**
     * Convenience method to truncate the database;
     */
    async truncateAllTables(): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.query("SET session_replication_role = replica;");

            await queryRunner.query(`
                TRUNCATE TABLE "user", encounter, user_report, pending_user RESTART IDENTITY CASCADE;
            `);

            await queryRunner.query("SET session_replication_role = DEFAULT;");
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
