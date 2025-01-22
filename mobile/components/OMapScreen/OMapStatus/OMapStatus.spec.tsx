import { Color } from "@/GlobalStyles";
import { TR } from "@/localization/translate.service";
import { render } from "@testing-library/react-native";
import React from "react";
import { Animated, Platform } from "react-native";
import { EMapStatus, OMapStatus } from "./OMapStatus";

// Mock dependencies
jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: "MaterialIcons",
}));

jest.mock("@/localization/translate.service", () => ({
    i18n: {
        t: (key: string) => {
            const translations = {
                [TR.loadingHeatmap]: "Loading Heatmap",
                [TR.loadingLocation]: "Loading Location",
                [TR.saving]: "Saving",
                [TR.live]: "Live",
                [TR.ghostMode]: "Ghost Mode",
            };
            return translations[key] || key;
        },
    },
    TR: {
        loadingHeatmap: "loadingHeatmap",
        loadingLocation: "loadingLocation",
        saving: "saving",
        live: "live",
        ghostMode: "ghostMode",
    },
}));

// Mock Animated.sequence and Animated.loop
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockAnimatedLoop = jest.fn(() => ({ start: mockStart, stop: mockStop }));
const mockAnimatedSequence = jest.fn(() => ({ start: mockStart }));

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native");
    return {
        ...RN,
        Animated: {
            ...RN.Animated,
            sequence: (animations: any[]) => mockAnimatedSequence(animations),
            loop: (animation: any) => mockAnimatedLoop(animation),
            timing: jest.fn(() => ({
                start: jest.fn(),
            })),
            Value: jest.fn(() => ({
                setValue: jest.fn(),
            })),
        },
    };
});

describe("OMapStatus", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Platform.OS = "ios";
    });

    it("should render loading heatmap status correctly", () => {
        const { getByText, getByTestId } = render(
            <OMapStatus status={EMapStatus.LOADING_HEATMAP} />,
        );

        expect(getByText("Loading Heatmap")).toBeTruthy();
        const icon = getByTestId("status-icon");
        expect(icon.props.color).toBe(Color.lightOrange);
    });

    it("should render loading location status correctly", () => {
        const { getByText, getByTestId } = render(
            <OMapStatus status={EMapStatus.LOADING_LOCATION} />,
        );

        expect(getByText("Loading Location")).toBeTruthy();
        const icon = getByTestId("status-icon");
        expect(icon.props.color).toBe(Color.lightOrange);
    });

    it("should render saving safezones status correctly", () => {
        const { getByText, getByTestId } = render(
            <OMapStatus status={EMapStatus.SAVING_SAFEZONES} />,
        );

        expect(getByText("Saving")).toBeTruthy();
        const icon = getByTestId("status-icon");
        expect(icon.props.color).toBe(Color.lightOrange);
    });

    it("should render live status correctly", () => {
        const { getByText, getByTestId } = render(
            <OMapStatus status={EMapStatus.LIVE} />,
        );

        expect(getByText("Live")).toBeTruthy();
        const icon = getByTestId("status-icon");
        expect(icon.props.color).toBe(Color.primary);
    });

    it("should render ghost status correctly", () => {
        const { getByText, getByTestId } = render(
            <OMapStatus status={EMapStatus.GHOST} />,
        );

        expect(getByText("Ghost Mode")).toBeTruthy();
        const icon = getByTestId("status-icon");
        expect(icon.props.color).toBe(Color.schemesPrimary);
    });

    it("should start animation for non-ghost status", () => {
        render(<OMapStatus status={EMapStatus.LIVE} />);

        expect(mockAnimatedSequence).toHaveBeenCalled();
        expect(mockAnimatedLoop).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalled();
    });

    it("should not start animation for ghost status", () => {
        render(<OMapStatus status={EMapStatus.GHOST} />);

        expect(mockAnimatedSequence).not.toHaveBeenCalled();
        expect(mockAnimatedLoop).not.toHaveBeenCalled();
        expect(mockStart).not.toHaveBeenCalled();
    });

    it("should handle animation cleanup on unmount", () => {
        const { unmount } = render(<OMapStatus status={EMapStatus.LIVE} />);

        unmount();

        // Verify animation value is reset
        expect(Animated.Value).toHaveBeenCalledWith(1);
    });

    it("should apply correct styles based on platform", () => {
        Platform.OS = "ios";
        const { container: iosContainer } = render(
            <OMapStatus status={EMapStatus.LIVE} />,
        );
        expect(iosContainer.props.style.marginBottom).toBe(16);

        Platform.OS = "android";
        const { container: androidContainer } = render(
            <OMapStatus status={EMapStatus.LIVE} />,
        );
        expect(androidContainer.props.style.marginBottom).toBe(0);
    });

    it("should update animation when status changes", () => {
        const { rerender } = render(<OMapStatus status={EMapStatus.LIVE} />);

        // Clear initial animation calls
        jest.clearAllMocks();

        // Update status
        rerender(<OMapStatus status={EMapStatus.LOADING_HEATMAP} />);

        expect(mockAnimatedSequence).toHaveBeenCalled();
        expect(mockAnimatedLoop).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalled();
    });

    it("should handle animation timing correctly", () => {
        render(<OMapStatus status={EMapStatus.LIVE} />);

        // Verify animation configuration
        expect(Animated.timing).toHaveBeenCalledTimes(2);
        expect(Animated.timing).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                toValue: 1.2,
                duration: 1000,
                useNativeDriver: true,
            }),
        );
        expect(Animated.timing).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        );
    });
});
