import { Request } from "express";

export const extractTokenFromHeader = (
    request: Request,
): string | undefined => {
    const [type, token] = request?.headers?.authorization?.split(" ") ?? [];
    // @dev Token if null client side might be stringified "null"
    return type === "Bearer" && token?.toLowerCase() !== "null"
        ? token
        : undefined;
};
