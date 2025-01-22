import { UserPrivateDTODateModeEnum } from "@/api/gen/src";
import { MOCK_HEATMAP_LOCATIONS } from "@/services/tourguide.service";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import { act, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Platform } from "react-native";
import { OHeatMap } from "./OHeatMap";

// Mock dependencies
jest.mock("@/utils/expo.utils", () => ({
    isExpoGoEnvironment: false,
}));

jest.mock("@sentry/react-native", () => ({
    captureException: jest.fn(),
}));

jest.mock("rn-tourguide", () => ({
    useTourGuideController: () => ({
        eventEmitter: {
            on: jest.fn(),
            off: jest.fn(),
        },
    }),
}));

jest.mock("@/utils/api-config", () => ({
    API: {
        map: {
            mapControllerGetUserLocations: jest.fn(),
        },
    },
}));

describe("OHeatMap", () => {
    const defaultProps = {
        showMap: true,
        userId: "test-user-id",
        datingMode: UserPrivateDTODateModeEnum.live,
        currentMapRegion: {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        onLoadingStateChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should not render anything when showMap is false", () => {
        const { container } = render(
            <OHeatMap {...defaultProps} showMap={false} />,
        );
        expect(container.children.length).toBe(0);
    });

    it("should not render anything in Expo Go environment", () => {
        jest.spyOn(
            require("@/utils/expo.utils"),
            "isExpoGoEnvironment",
        ).mockReturnValue(true);
        const { container } = render(<OHeatMap {...defaultProps} />);
        expect(container.children.length).toBe(0);
    });

    it("should fetch locations when dating mode is live", async () => {
        const mockLocations = [
            { latitude: 1, longitude: 1, weight: 1 },
            { latitude: 2, longitude: 2, weight: 2 },
        ];

        API.map.mapControllerGetUserLocations.mockResolvedValue(mockLocations);

        await act(async () => {
            render(<OHeatMap {...defaultProps} />);
        });

        expect(API.map.mapControllerGetUserLocations).toHaveBeenCalledWith({
            userId: defaultProps.userId,
        });
        expect(defaultProps.onLoadingStateChange).toHaveBeenCalledWith(true);
        await waitFor(() => {
            expect(defaultProps.onLoadingStateChange).toHaveBeenCalledWith(
                false,
            );
        });
    });

    it("should handle API errors gracefully", async () => {
        const error = new Error("API Error");
        API.map.mapControllerGetUserLocations.mockRejectedValue(error);

        await act(async () => {
            render(<OHeatMap {...defaultProps} />);
        });

        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
            tags: { map: "heatmap" },
        });
        expect(defaultProps.onLoadingStateChange).toHaveBeenCalledWith(false);
    });

    it("should handle missing userId", async () => {
        await act(async () => {
            render(<OHeatMap {...defaultProps} userId={undefined} />);
        });

        expect(Sentry.captureException).toHaveBeenCalledWith(
            new Error("Undefined user id in getOtherUsersPosition (Heatmap)"),
            { tags: { heatMap: "getOtherUsersPositions" } },
        );
    });

    it("should use platform-specific radius values", () => {
        // Test Android radius
        Platform.select = jest
            .fn()
            .mockImplementation(({ android }) => android);
        let { getByTestId } = render(<OHeatMap {...defaultProps} />);
        let heatmap = getByTestId("encounters.heatMapComponent");
        expect(heatmap.props.radius).toBe(50);

        // Test iOS radius
        Platform.select = jest.fn().mockImplementation(({ ios }) => ios);
        ({ getByTestId } = render(<OHeatMap {...defaultProps} />));
        heatmap = getByTestId("encounters.heatMapComponent");
        expect(heatmap.props.radius).toBe(200);
    });

    it("should update locations during tour guide step changes", async () => {
        const mockEventEmitter = {
            on: jest.fn(),
            off: jest.fn(),
        };

        jest.spyOn(
            require("rn-tourguide"),
            "useTourGuideController",
        ).mockReturnValue({
            eventEmitter: mockEventEmitter,
        });

        render(<OHeatMap {...defaultProps} />);

        // Get the stepChange callback
        const [[, stepChangeCallback]] = mockEventEmitter.on.mock.calls;

        // Simulate step 2 of the tour
        act(() => {
            stepChangeCallback({ order: 2 });
        });

        // Verify mock locations are set based on current map region
        expect(MOCK_HEATMAP_LOCATIONS).toHaveBeenCalledWith(
            defaultProps.currentMapRegion,
        );

        // Simulate tour stop
        const [[, , stopCallback]] = mockEventEmitter.on.mock.calls;

        act(() => {
            stopCallback();
        });

        // Verify cleanup
        expect(mockEventEmitter.off).toHaveBeenCalled();
    });
});
