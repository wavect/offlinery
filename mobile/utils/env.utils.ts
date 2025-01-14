export const IS_DEVELOPMENT_BUILD =
    process.env.EXPO_PUBLIC_ENVIRONMENT?.trim() === "development";

export const USE_EMULATOR =
    process.env.EXPO_PUBLIC_USE_EMULATOR?.trim() === "true";
