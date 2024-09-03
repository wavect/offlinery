export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/** @dev Helper function to attach a JSONWebToken to authenticated requests. */
export const getJwtHeader = (jwt?: string): RequestInit => {
    if (!jwt) {
        throw new Error("No JWT available, authenticate first!");
    }
    return {
        headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
        },
    };
};
