import { LOCAL_NETWORK_IP } from "@/main";

export const getBaseUrl = (): string => {
    if (process.env.NODE_ENV === "development") {
        return `http://${LOCAL_NETWORK_IP}:3000`;
    }
    return `https://offlinery.onrender.com`;
};
