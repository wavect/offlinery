import { DataSource } from "typeorm";

export const clearDatabase = async (dataSource: DataSource) => {
    await dataSource.query(`
            TRUNCATE TABLE "user", encounter, user_report RESTART IDENTITY CASCADE;
        `);
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
    createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
    })),
};
