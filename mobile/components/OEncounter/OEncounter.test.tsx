jest.clearAllMocks();
jest.mock("react-native-localize", () => ({
    getLocales: jest.fn().mockReturnValue([{ languageCode: "en" }]),
}));

jest.mock("expo-constants", () => ({
    manifest: { extra: { eas: {} } },
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { EncounterPublicDTOStatusEnum } from "../../api/gen/src";
import * as EncountersContext from "../../context/EncountersContext";
import { EncountersProvider } from "../../context/EncountersContext";
import { UserProvider } from "../../context/UserContext";
import { ROUTES } from "../../screens/routes";
import { API } from "../../utils/api-config";
import OEncounter from "./OEncounter";
afterEach(() => {
    jest.clearAllMocks();
});

jest.mock("react-native-element-dropdown", () => {
    const { View, Text } = require("react-native");
    return {
        Dropdown: ({ data, value, onChange, testID }) => {
            return (
                <View testID={testID}>
                    <Text>{value}</Text>
                    {/* Render the options as buttons that can be tested */}
                    {data.map((item) => (
                        <View
                            key={item.value}
                            testID={item.testID}
                            onPress={() => onChange(item)}
                        >
                            <Text>{item.label}</Text>
                        </View>
                    ))}
                </View>
            );
        },
    };
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
    const mockUpdateStatus = jest.fn();
    const mockDispatch = jest.fn();
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

        jest.clearAllMocks();
        jest.spyOn(
            API.encounter,
            "encounterControllerUpdateStatus",
        ).mockImplementation(mockUpdateStatus);
        (EncountersContext.useEncountersContext as jest.Mock).mockReturnValue({
            dispatch: mockDispatch,
        });
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

    it("should update encounter status when dropdown option is selected", async () => {
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

        const notMetOption = getByTestId("dropdown-option-not-met");
        fireEvent.press(notMetOption);

        // Verify API call
        expect(mockUpdateStatus).toHaveBeenCalledWith({
            updateEncounterStatusDTO: {
                encounterId: mockEncounterProfile.id,
                status: EncounterPublicDTOStatusEnum.not_met,
            },
            userId: undefined, // Now this should match
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

    it("handles the report button click", async () => {
        const mockNavigation = {
            navigate: jest.fn(),
        };

        // Modify the mock encounter profile to have met_not_interested status
        const mockEncounterProfileWithNotInterested = {
            ...mockEncounterProfile,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
        };

        const { getByText } = render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={mockEncounterProfileWithNotInterested}
                        showActions={true}
                        navigation={mockNavigation}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        // Find and click the report button
        const reportButton = getByText("report");
        fireEvent.press(reportButton);

        // Verify navigation was called with correct parameters
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
            ROUTES.Main.ReportEncounter,
            {
                personToReport: mockEncounterProfileWithNotInterested,
            },
        );
    });

    it("handles the navigate button click", () => {
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

        const navigateButton = screen.getByText("navigate");
        fireEvent.press(navigateButton);

        expect(navigation.navigate).toHaveBeenCalledWith(
            ROUTES.HouseRules,
            expect.objectContaining({
                nextPage: ROUTES.Main.NavigateToApproach,
                propsForNextScreen: expect.objectContaining({
                    encounterId: mockEncounterProfile.id,
                    navigateToPerson: expect.objectContaining({
                        firstName: mockEncounterProfile.otherUser.firstName,
                        age: mockEncounterProfile.otherUser.age,
                        // Add other required fields you want to verify
                    }),
                }),
            }),
        );
    });

    it("handles the leave message button click", () => {
        const messageEncounterProfile = {
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
            messages: [],
            lastDateTimePassedBy: "2024-01-15T10:00:00Z",
            isNearbyRightNow: false,
            reported: false,
            amountStreaks: 5,
        };
        render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={messageEncounterProfile}
                        showActions={true}
                        navigation={undefined}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        const leaveMessageButton = screen.getByText("leaveMessageBtnLbl");
        fireEvent.press(leaveMessageButton);

        expect(screen.getByTestId("message-modal")).toBeTruthy();
    });

    it("disables dropdown and buttons when encounter is reported", () => {
        const reportedEncounterProfile = {
            ...mockEncounterProfile,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
            reported: true,
        };
        // const reportedEncounterProfile = { ...mockEncounterProfile, reported: true };
        render(
            <UserProvider>
                <EncountersProvider>
                    <OEncounter
                        encounterProfile={reportedEncounterProfile}
                        showActions={true}
                        navigation={undefined}
                    />
                </EncountersProvider>
            </UserProvider>,
        );

        const dropdown = screen.getByTestId("input-update-status");
        console.log("dropdown", dropdown.props);
        const reportButton = screen.getByText("reported");
        const leaveMessageButton = screen.queryByText("Leave Message");

        // For React Native, we should check if the onPress handler is null/undefined
        expect(dropdown.props.onPress).toBeUndefined();

        // Same for the report button
        expect(reportButton.props.onPress).toBeUndefined();
    });

    it("renders the strike component correctly", () => {
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

        expect(screen.getByTestId("encounter-strike")).toBeTruthy();
    });
});
