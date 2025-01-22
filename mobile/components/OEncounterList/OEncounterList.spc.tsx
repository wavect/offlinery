import { useEncountersContext } from "@/context/EncountersContext";
import { useUserContext } from "@/context/UserContext";
import { saveLocalValue } from "@/services/storage.service";
import { API } from "@/utils/api-config";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { OEncounterList } from "./OEncounterList";

// Mock all required dependencies
jest.mock("@/utils/api-config");
jest.mock("@/context/UserContext");
jest.mock("@/context/EncountersContext");
jest.mock("@/services/storage.service");
jest.mock("@sentry/react-native");
jest.mock("@react-navigation/native");
jest.mock("rn-tourguide", () => ({
    useTourGuideController: () => ({
        eventEmitter: {
            on: jest.fn(),
            off: jest.fn(),
        },
        stop: jest.fn(),
    }),
}));

describe("OEncounterList", () => {
    const mockNavigation = {
        navigate: jest.fn(),
    };

    const mockDispatch = jest.fn();
    const defaultUserState = {
        id: "test-user-id",
    };

    const defaultEncounterState = {
        encounters: [],
        isWalkthroughRunning: false,
    };

    const defaultProps = {
        metStartDateFilter: new Date("2025-01-01"),
        metEndDateFilter: new Date("2025-01-22"),
    };

    const mockEncounters = [
        { id: "1", name: "Test Encounter 1" },
        { id: "2", name: "Test Encounter 2" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
        (useUserContext as jest.Mock).mockReturnValue({
            state: defaultUserState,
        });
        (useEncountersContext as jest.Mock).mockReturnValue({
            state: defaultEncounterState,
            dispatch: mockDispatch,
        });
        (useIsFocused as jest.Mock).mockReturnValue(true);
        (
            API.encounter.encounterControllerGetEncountersByUser as jest.Mock
        ).mockResolvedValue(mockEncounters);
    });

    it("should show loading indicator initially", () => {
        const { getByTestId } = render(<OEncounterList {...defaultProps} />);
        expect(getByTestId("loading-indicator")).toBeTruthy();
    });

    it("should fetch encounters on mount", async () => {
        await act(async () => {
            render(<OEncounterList {...defaultProps} />);
        });

        expect(
            API.encounter.encounterControllerGetEncountersByUser,
        ).toHaveBeenCalledWith({
            userId: "test-user-id",
            startDate: defaultProps.metStartDateFilter,
            endDate: defaultProps.metEndDateFilter,
        });
    });

    it("should handle successful encounter fetch", async () => {
        await act(async () => {
            render(<OEncounterList {...defaultProps} />);
        });

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "PUSH_MULTIPLE",
            payload: mockEncounters,
        });
    });

    it("should handle API errors gracefully", async () => {
        const error = new Error("API Error");
        (
            API.encounter.encounterControllerGetEncountersByUser as jest.Mock
        ).mockRejectedValueOnce(error);

        await act(async () => {
            render(<OEncounterList {...defaultProps} />);
        });

        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
            tags: { encounters: "fetch" },
        });
    });

    it("should handle missing user ID", async () => {
        (useUserContext as jest.Mock).mockReturnValue({
            state: { id: undefined },
        });

        await act(async () => {
            render(<OEncounterList {...defaultProps} />);
        });

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
            "fetchEncounters: UserId undefined. Not making request. User maybe logging out or so?",
        );
    });

    it("should handle pull-to-refresh", async () => {
        const { getByTestId } = render(<OEncounterList {...defaultProps} />);

        await act(async () => {
            const scrollView = getByTestId("encounter-list-scroll");
            fireEvent.refresh(scrollView);
        });

        expect(
            API.encounter.encounterControllerGetEncountersByUser,
        ).toHaveBeenCalledTimes(2);
    });

    it("should show empty state when no encounters", async () => {
        (
            API.encounter.encounterControllerGetEncountersByUser as jest.Mock
        ).mockResolvedValueOnce([]);

        const { getByText } = await act(async () => {
            return render(<OEncounterList {...defaultProps} />);
        });

        expect(getByText("nobodyWasNearby")).toBeTruthy();
        expect(getByText("nobodyWasNearbySubtitle")).toBeTruthy();
    });

    it("should render encounters list when data exists", async () => {
        const { getAllByTestId } = await act(async () => {
            const result = render(<OEncounterList {...defaultProps} />);
            await waitFor(() =>
                expect(result.queryByTestId("loading-indicator")).toBeNull(),
            );
            return result;
        });

        expect(getAllByTestId("encounter-item")).toHaveLength(
            mockEncounters.length,
        );
    });

    it("should handle tour guide interactions", async () => {
        await act(async () => {
            render(<OEncounterList {...defaultProps} />);
        });

        // Simulate tour stop
        const tourGuideEventEmitter =
            require("rn-tourguide").useTourGuideController().eventEmitter;
        await act(async () => {
            tourGuideEventEmitter.on.mock.calls[0][1]();
        });

        expect(saveLocalValue).toHaveBeenCalledWith(
            "HAS_DONE_ENCOUNTER_WALKTHROUGH",
            "true",
        );
        expect(mockDispatch).toHaveBeenCalledWith({
            type: "SET_IS_WALKTHROUGH_RUNNING",
            payload: false,
        });
    });

    it("should stop tour guide when screen loses focus", async () => {
        const stopTourGuide = jest.fn();
        (
            require("rn-tourguide").useTourGuideController as jest.Mock
        ).mockReturnValue({
            eventEmitter: { on: jest.fn(), off: jest.fn() },
            stop: stopTourGuide,
        });

        const { rerender } = render(<OEncounterList {...defaultProps} />);

        // Simulate screen losing focus
        (useIsFocused as jest.Mock).mockReturnValue(false);
        rerender(<OEncounterList {...defaultProps} />);

        expect(stopTourGuide).toHaveBeenCalled();
    });

    it("should refetch encounters when date filters change", async () => {
        const { rerender } = render(<OEncounterList {...defaultProps} />);

        const newProps = {
            metStartDateFilter: new Date("2025-02-01"),
            metEndDateFilter: new Date("2025-02-22"),
        };

        await act(async () => {
            rerender(<OEncounterList {...newProps} />);
        });

        expect(
            API.encounter.encounterControllerGetEncountersByUser,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                startDate: newProps.metStartDateFilter,
                endDate: newProps.metEndDateFilter,
            }),
        );
    });

    it("should cleanup on unmount", async () => {
        const { unmount } = render(<OEncounterList {...defaultProps} />);

        await act(async () => {
            unmount();
        });

        const tourGuideEventEmitter =
            require("rn-tourguide").useTourGuideController().eventEmitter;
        expect(tourGuideEventEmitter.off).toHaveBeenCalled();
    });
});
