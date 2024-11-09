import { ExpoPushTicket } from "expo-server-sdk";
import { from, lastValueFrom, reduce } from "rxjs"; // @dev keep relative import here for migrations
import { TYPED_ENV } from "./env.utils";

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

/** @DEV - Expiration time of each registration token */
export const MAX_ENCOUNTERS_PER_DAY_FOR_USER = 3;

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

export function arraySafeCheck<T>(obj: any): Array<T> {
    if (!obj) return [];
    return obj;
}

interface StatusCount {
    ok: number;
    error: number;
    total: number;
}
export function countExpoPushTicketStatuses(
    expoPushTickets: ExpoPushTicket[],
): Promise<StatusCount> {
    return lastValueFrom(
        from(expoPushTickets).pipe(
            reduce(
                (acc: StatusCount, ticket: ExpoPushTicket) => ({
                    ok: acc.ok + (ticket.status === "ok" ? 1 : 0),
                    error: acc.error + (ticket.status === "error" ? 1 : 0),
                    total: acc.total + 1,
                }),
                { ok: 0, error: 0, total: 0 },
            ),
        ),
    );
}
