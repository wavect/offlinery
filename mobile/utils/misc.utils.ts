export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getJwtHeader = (jwt: string): RequestInit => {
    return {
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
    };
};
