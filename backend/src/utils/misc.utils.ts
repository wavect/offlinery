import { TYPED_ENV } from "@/utils/env.utils";
import process from "process";

export const API_VERSION = "1";

export const BE_ENDPOINT =
    process.env.NODE_ENV === "development"
        ? `http://localhost:${TYPED_ENV.BE_PORT}`
        : "https://api.offlinery.io";

/** @DEV - Expiration time of each user token */
export const TOKEN_EXPIRATION_TIME = "60m";

/** @DEV - Expiration time of each registration token */
export const REGISTRATION_TOKEN_TIME = "1d";
