import { TYPED_ENV } from "@/utils/env.utils";

export const API_VERSION = "1";
export const IS_DEV_MODE =
    TYPED_ENV.NODE_ENV?.toLowerCase()?.trim() === "development";

export const BE_ENDPOINT = IS_DEV_MODE
    ? `http://localhost:${TYPED_ENV.BE_PORT}`
    : "https://api.offlinery.io";

/** @DEV - Expiration time of each user token */
export const TOKEN_EXPIRATION_TIME = "60m";

/** @DEV - Expiration time of each registration token */
export const REGISTRATION_TOKEN_TIME = "1d";

export function getAgeRangeParsed(ageRangeString: string): number[] {
    if (!ageRangeString) {
        return [];
    }
    const range = ageRangeString.match(/[\d]+/g);
    return range ? range.map(Number) : [];
}

export function getAgeRangeParsedForPrivateDto(
    ageRangeString: string,
): number[] {
    const arr = getAgeRangeParsed(ageRangeString);
    // Apparently postgres always saves ranges with the upper bound being exclusive.
    // That means if we save [18,30], postgres actually saves [18,31). Therefore
    // we decrement the upper bound by 1 to represent the actual range since we do not
    // respect bounds and use the values as they are.
    if (arr.length === 2) {
        arr[1] -= 1;
    }
    return arr;
}

export function parseToAgeRangeString(range: number[]): string {
    if (range.length !== 2) {
        throw new Error(`Range must have length 2: ${range}`);
    }
    return `[${range[0]}, ${range[1]}]`;
}

export const environmentSpecificPathPrefix = IS_DEV_MODE ? ".." : "";
