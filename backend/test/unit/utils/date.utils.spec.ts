import { getAge } from "@/utils/date.utils";

describe("getAge", () => {
    const mockDate = new Date("2024-01-01");

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it("calculates age correctly for Date input", () => {
        const birthday = new Date("1990-01-01");
        expect(getAge(birthday)).toBe(34);
    });

    it("calculates age correctly for string input", () => {
        expect(getAge("1990-01-01")).toBe(34);
    });

    it("returns 0 for future dates", () => {
        expect(getAge("2025-01-01")).toBe(0);
    });

    it("handles leap years correctly", () => {
        expect(getAge("2000-02-29")).toBe(23);
    });

    it("calculates age correctly for edge cases", () => {
        expect(getAge("2023-12-31")).toBe(0);
        expect(getAge("2023-01-01")).toBe(1);
    });
});
