jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native");

    // Deep clone the NativeModules to avoid directly mutating read-only properties
    const NativeModules = { ...RN.NativeModules };

    // Mock `RNGestureHandlerModule`
    NativeModules.RNGestureHandlerModule = {
        attachGestureHandler: jest.fn(),
        createGestureHandler: jest.fn(),
        dropGestureHandler: jest.fn(),
        updateGestureHandler: jest.fn(),
        State: {},
        Directions: {},
    };

    return {
        ...RN,
        NativeModules,
    };
});
