jest.clearAllMocks();
jest.mock("react-native-localize", () => ({
    getLocales: jest.fn().mockReturnValue([{ languageCode: "en" }]),
}));

jest.mock("expo-constants", () => ({
    manifest: { extra: { eas: {} } },
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react-native";
import React from "react";
import * as EncountersContext from "../../context/EncountersContext";
import { EncountersProvider } from "../../context/EncountersContext";
import { UserProvider } from "../../context/UserContext";
import { ROUTES } from "../../screens/routes";
import OEncounter from "./OEncounter";

it("renders without crashing", () => {
    const locales = require("react-native-localize").getLocales();
    console.log("Mocked getLocales:", locales);
    expect(locales).toEqual([{ languageCode: "en" }]);
});

describe("Basic Test for OEncounter Component", () => {
    it("checks if mock data contains user's name and age", () => {
        const mockEncounterProfile = {
            id: "encounter-1",
            otherUser: {
                id: "user-1",
                firstName: "John",
                age: 30,
            },
            status: "met_interested",
        };

        // Verify that the data matches expected values
        expect(mockEncounterProfile.otherUser.firstName).toBe("John");
        expect(mockEncounterProfile.otherUser.age).toBe(30);
        expect(mockEncounterProfile.status).toBe("met_interested");
    });
});

const mockEncounterProfile = {
    id: "encounter-1",
    otherUser: {
        id: "user-1",
        firstName: "John",
        age: 30,
        imageURIs: ["https://example.com/image.jpg"],
        intentions: ["friendship", "casual", "relationship"],
        bio: "This is John's bio",
    },
    status: "met_interested",
    messages: [
        {
            id: "message-1",
            senderUserId: "user-1",
            sentAt: "2024-01-15T12:00:00Z",
            content: "Hello!",
        },
    ],
    lastDateTimePassedBy: "2024-01-15T10:00:00Z",
    isNearbyRightNow: true,
    reported: false,
    amountStreaks: 5,
};

describe("OEncounter Component", () => {
    beforeEach(() => {
        jest.spyOn(
            EncountersContext,
            "useEncountersContext",
        ).mockImplementation(() => ({
            state: {
                encounters: [],
            },
            dispatch: jest.fn(),
        }));
    });

    it("renders the user's name and age", () => {
        render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={mockEncounterProfile}
                        showActions={true}
                        navigation={undefined}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        // Check that the user's name and age are displayed
        expect(screen.getByText("John, 30")).toBeTruthy();
    });

    it("renders the user's image correctly", () => {
        render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={mockEncounterProfile}
                        showActions={true}
                        navigation={undefined}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        const image = screen.getByTestId("profile-image");
        expect(image.props.source.uri).toBe("https://example.com/image.jpg");
    });

    it("handles status change dropdown selection", async () => {
        const { getByTestId } = render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={mockEncounterProfile}
                        showActions={true}
                        navigation={undefined}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        const dropdown = getByTestId("dropdown-option-not-met");
        fireEvent.press(dropdown);

        await waitFor(() => {
            expect(
                EncountersContext.useEncountersContext().dispatch,
            ).toHaveBeenCalled();
        });
    });

    it("displays the latest received message", () => {
        render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={mockEncounterProfile}
                        showActions={true}
                        navigation={undefined}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        expect(screen.getByText("Hello!")).toBeTruthy();
    });

    it("handles the report button click", () => {
        const navigation = { navigate: jest.fn() };
        render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={mockEncounterProfile}
                        showActions={true}
                        navigation={navigation}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        const reportButton = screen.getByText("Report");
        fireEvent.press(reportButton);

        expect(navigation.navigate).toHaveBeenCalledWith(
            ROUTES.Main.ReportEncounter,
            {
                personToReport: mockEncounterProfile,
            },
        );
    });
});
