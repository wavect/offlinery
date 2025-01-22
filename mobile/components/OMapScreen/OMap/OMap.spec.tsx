import { UserPrivateDTODateModeEnum } from "@/api/gen/src";
import { useUserContext } from "@/context/UserContext";
import { useUserLocation } from "@/hooks/useUserLocation";
import { LOCAL_VALUE, saveLocalValue } from "@/services/storage.service";
import { API } from "@/utils/api-config";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { OMap } from "./OMap";

// Mock all required dependencies
jest.mock("@/hooks/useUserLocation");
jest.mock("@/context/UserContext");
jest.mock("@/services/storage.service");
jest.mock("@/utils/map-provider", () => ({
    getMapProvider: jest.fn(() => "google"),
}));
jest.mock("react-native-background-geolocation");
jest.mock("@react-navigation/native", () => ({
    useIsFocused: jest.fn(() => true),
}));
jest.mock("rn-tourguide", () => ({
    useTourGuideController: () => ({
        eventEmitter: {
            on: jest.fn(),
            off: jest.fn(),
        },
        stop: jest.fn(),
    }),
    TourGuideZone: ({ children }) => children,
}));
jest.mock("@/utils/api-config", () => ({
    API: {
        user: {
            userControllerUpdateUser: jest.fn(),
        },
    },
}));

describe("OMap", () => {
    const mockDispatch = jest.fn();
    const defaultState = {
        id: "test-user-id",
        dateMode: UserPrivateDTODateModeEnum.live,
        blacklistedRegions: [],
    };

    const defaultProps = {
        saveChangesToBackend: true,
        showHeatmap: true,
        showBlacklistedRegions: true,
        showMapStatus: true,
    };

    const mockLocation = {
        coords: {
            latitude: 47.257832302,
            longitude: 11.383665132,
            accuracy: 10,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useUserContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
        });
        (useUserLocation as jest.Mock).mockReturnValue(mockLocation);
    });

    it("should render correctly with initial state", () => {
        const { getByTestId } = render(<OMap {...defaultProps} />);
        expect(getByTestId("map-view")).toBeTruthy();
    });

    it("should update map status based on dating mode", () => {
        const { rerender } = render(<OMap {...defaultProps} />);

        // Test LIVE mode
        expect(getByTestId("map-status")).toHaveTextContent("LIVE");

        // Test GHOST mode
        (useUserContext as jest.Mock).mockReturnValue({
            state: {
                ...defaultState,
                dateMode: UserPrivateDTODateModeEnum.ghost,
            },
            dispatch: mockDispatch,
        });

        rerender(<OMap {...defaultProps} />);
        expect(getByTestId("map-status")).toHaveTextContent("GHOST");
    });

    it("should handle long press to create blacklisted region", async () => {
        const { getByTestId } = render(<OMap {...defaultProps} />);

        const mapView = getByTestId("map-view");
        const longPressEvent = {
            nativeEvent: {
                coordinate: {
                    latitude: 47.25,
                    longitude: 11.38,
                },
            },
        };

        await act(async () => {
            fireEvent(mapView, "onLongPress", longPressEvent);
        });

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "UPDATE_MULTIPLE",
            payload: {
                blacklistedRegions: [
                    {
                        latitude: 47.25,
                        longitude: 11.38,
                        radius: 250,
                    },
                ],
            },
        });
    });

    it("should save changes to backend with debounce", async () => {
        jest.useFakeTimers();

        const { getByTestId } = render(<OMap {...defaultProps} />);

        // Simulate adding a blacklisted region
        const mapView = getByTestId("map-view");
        fireEvent(mapView, "onLongPress", {
            nativeEvent: {
                coordinate: {
                    latitude: 47.25,
                    longitude: 11.38,
                },
            },
        });

        // Fast forward debounce timer
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(API.user.userControllerUpdateUser).toHaveBeenCalledWith({
            userId: "test-user-id",
            updateUserDTO: {
                blacklistedRegions: [
                    {
                        latitude: 47.25,
                        longitude: 11.38,
                        radius: 250,
                    },
                ],
            },
        });

        jest.useRealTimers();
    });

    it("should handle region selection and radius updates", async () => {
        const initialRegions = [
            {
                latitude: 47.25,
                longitude: 11.38,
                radius: 250,
            },
        ];

        (useUserContext as jest.Mock).mockReturnValue({
            state: { ...defaultState, blacklistedRegions: initialRegions },
            dispatch: mockDispatch,
        });

        const { getByTestId } = render(<OMap {...defaultProps} />);

        // Select region
        const region = getByTestId("blacklisted-region-0");
        fireEvent.press(region);

        // Update radius
        const slider = getByTestId("radius-slider");
        fireEvent(slider, "onValueChange", 300);

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "UPDATE_MULTIPLE",
            payload: {
                blacklistedRegions: [
                    {
                        ...initialRegions[0],
                        radius: 300,
                    },
                ],
            },
        });
    });

    it("should handle tour guide interactions", async () => {
        const { getByTestId } = render(<OMap {...defaultProps} />);

        // Simulate tour guide step change
        await act(async () => {
            const tourGuideEventEmitter =
                require("rn-tourguide").useTourGuideController().eventEmitter;
            tourGuideEventEmitter.on.mock.calls[1][1]({ order: 3 });
        });

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "UPDATE_MULTIPLE",
            payload: {
                blacklistedRegions: expect.arrayContaining([
                    expect.objectContaining({
                        radius: 250,
                    }),
                ]),
            },
        });

        // Simulate tour end
        await act(async () => {
            const tourGuideEventEmitter =
                require("rn-tourguide").useTourGuideController().eventEmitter;
            tourGuideEventEmitter.on.mock.calls[0][1]();
        });

        expect(saveLocalValue).toHaveBeenCalledWith(
            LOCAL_VALUE.HAS_DONE_FIND_WALKTHROUGH,
            "true",
        );
    });

    it("should cleanup on unmount", () => {
        const { unmount } = render(<OMap {...defaultProps} />);

        unmount();

        // Verify event listeners are removed
        const tourGuideEventEmitter =
            require("rn-tourguide").useTourGuideController().eventEmitter;
        expect(tourGuideEventEmitter.off).toHaveBeenCalledTimes(2);
    });

    it("should handle loading states correctly", async () => {
        const { getByTestId } = render(<OMap {...defaultProps} />);

        // Simulate heatmap loading
        await act(async () => {
            const heatmap = getByTestId("heatmap");
            fireEvent(heatmap, "onLoadingStateChange", true);
        });

        expect(getByTestId("map-status")).toHaveTextContent("LOADING_HEATMAP");

        // Simulate heatmap loaded
        await act(async () => {
            const heatmap = getByTestId("heatmap");
            fireEvent(heatmap, "onLoadingStateChange", false);
        });

        expect(getByTestId("map-status")).toHaveTextContent("LIVE");
    });
});
