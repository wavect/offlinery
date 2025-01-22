import type { Config } from "jest";

const config: Config = {
    preset: "jest-expo",
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transformIgnorePatterns: [
        "node_modules/(?!(react-native|@react-native|react-native-reanimated|@react-native/.*|@babel/.*|@expo/.*|@react-navigation/.*|@react-native-js-polyfills)/)",
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest",
    },
    collectCoverageFrom: [
        "**/*.{ts,tsx}",
        "!**/coverage/**",
        "!**/node_modules/**",
        "!**/babel.config.js",
        "!**/jest.setup.js",
    ],
    moduleDirectories: ["node_modules", "src"],
    setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;
