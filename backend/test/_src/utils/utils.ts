import { existsSync, mkdirSync, writeFileSync } from "fs";
import { DataSource } from "typeorm";

export const clearDatabase = async (dataSource: DataSource) => {
    await dataSource.query(`
            TRUNCATE TABLE "user", encounter, user_report RESTART IDENTITY CASCADE;
        `);
};

/** @DEV use this with caution and rarely. */
export const testSleep = (ms) => {
    return new Promise((r) => setTimeout(r, ms));
};

export const generateRandomString = (length: number = 15): string => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    return Array.from(
        { length },
        () => characters[Math.floor(Math.random() * characters.length)],
    ).join("");
};

export const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
    })),
};

export function writeBenchmarkResult(result: any) {
    const benchmarksDir = "./benchmarks";
    if (!existsSync(benchmarksDir)) {
        mkdirSync(benchmarksDir);
    }

    const filePath = `${benchmarksDir}/benchmark-results-${new Date().toISOString()}.json`;
    writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log(`Benchmark results written to ${filePath}`);
}
