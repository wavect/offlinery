import { TYPED_ENV } from "@/utils/env.utils";
import process from "process";

export const API_VERSION = "1";

export const BE_ENDPOINT =
    process.env.NODE_ENV === "development"
        ? `http://localhost:${TYPED_ENV.BE_PORT}`
        : "https://offlinery-ys39.onrender.com";
