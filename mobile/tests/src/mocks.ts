// tests/setup/testMocks.ts

// Clear all mocks
jest.clearAllMocks();

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: function MockMaterialIcons(props) {
        return null;
    },
}));

// Mock OEncounterStrike
jest.mock("@/components/OEncounterStrike/OEncounterStrike", () => ({
    OEncounterStrike: function MockOEncounterStrike(props) {
        return null;
    },
}));

// Mock expo
jest.mock("expo", () => ({
    Expo: {
        moduleNames: ["ExponentConstants"],
    },
}));

// Mock async storage
jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock react-native-localize
jest.mock("react-native-localize", () => ({
    getLocales: jest.fn().mockReturnValue([{ languageCode: "en" }]),
}));

jest.mock("expo-localization", () => ({
    getLocales: () => [
        {
            languageCode: "en",
            languageTag: "en-US",
            regionCode: "US",
            isRTL: false,
        },
    ],
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
    manifest: { extra: { eas: {} } },
}));

// Mock tourguide
jest.mock("rn-tourguide", () => ({
    useTourGuideController: () => ({
        start: jest.fn(),
        stop: jest.fn(),
        eventEmitter: {
            on: jest.fn(),
            off: jest.fn(),
        },
    }),
    TourGuideProvider: ({ children }) => children,
    TourGuideContext: {
        Provider: ({ children }) => children,
    },
    TourGuideZone: ({ children }) => children,
}));
