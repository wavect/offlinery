export const getBaseUrl = (): string => {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
    }
    return `https://offlinery.onrender.com`;
};
