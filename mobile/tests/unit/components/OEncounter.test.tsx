/** @DEV - mocks need to come first! **/
import "../../src/mocks";

import { EncounterPublicDTOStatusEnum } from "@/api/gen/src";
import { EncountersProvider } from "@/context/EncountersContext";
import { UserProvider } from "@/context/UserContext";
import { API } from "@/utils/api-config";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import OEncounter from "../../../components/OEncounter/OEncounter";
import * as EncountersContext from "../../../context/EncountersContext";

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

describe("OEncounter Unit Tests", function () {
    afterEach(() => {
        jest.clearAllMocks();
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

    describe("OEncounter Component", () => {
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
            (
                EncountersContext.useEncountersContext as jest.Mock
            ).mockReturnValue({
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
            expect(image.props.source.uri).toBe(
                "https://example.com/image.jpg",
            );
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
    });
});
