import {
    EncounterPublicDTO,
    EncounterPublicDTOStatusEnum,
    MessagePublicDTO,
    UserPrivateDTOApproachChoiceEnum,
    UserPublicDTO,
} from "@/api/gen/src";
import * as EncountersContext from "@/context/EncountersContext";
import { IEncounters } from "@/context/EncountersContext";
import * as UserContext from "@/context/UserContext";
import { IUserData } from "@/context/UserContext";
import { API } from "@/utils/api-config";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import OEncounter from "./OEncounter";

// Mock the required dependencies
jest.mock("@/utils/media.utils", () => ({
    getValidImgURI: jest.fn((uri) => uri),
}));

jest.mock("@/utils/date.utils", () => ({
    getTimePassedWithText: jest.fn(() => "2 hours ago"),
}));

jest.mock("rn-tourguide", () => ({
    useTourGuideController: () => ({
        tourKey: "test-key",
        stop: jest.fn(),
    }),
    TourGuideZone: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: "MaterialIcons",
}));

const mockNavigation = {
    navigate: jest.fn(),
};

const mockDispatch = jest.fn();

// Create a complete mock user state that implements IUserData
const mockUserState: Partial<IUserData> = {
    id: "user123",
    approachChoice: UserPrivateDTOApproachChoiceEnum.approach,
    wantsEmailUpdates: true,
    email: "test@example.com",
    firstName: "Test",
    clearPassword: "",
    // lastName: 'User',
    // birthDate: new Date().toISOString(),
    // gender: 'MALE',
    // phoneNumber: '+1234567890',
    bio: "Test bio",
    // imageURIs: [],
    intentions: [],
    // isProfileComplete: true
};

const mockOtherUser: UserPublicDTO = {
    id: "other123",
    firstName: "John",
    age: 25,
    imageURIs: ["https://example.com/image.jpg"],
    intentions: ["friendship"],
    bio: "Test bio",
    // gender: 'MALE',
    // lastName: 'Doe',
    trustScore: 0,
    // isOnline: false,
    // isSubscribed: false,
    // location: { type: 'Point', coordinates: [0, 0] }
};

const defaultEncounter: EncounterPublicDTO = {
    id: "encounter123",
    status: EncounterPublicDTOStatusEnum.not_met,
    otherUser: mockOtherUser,
    messages: [],
    amountStreaks: 2,
    isNearbyRightNow: false,
    reported: false,
    lastDateTimePassedBy: new Date().toISOString(),
    // longitude: 0,
    // latitude: 0,
    // distanceInMeters: 0
};

describe("OEncounter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(EncountersContext, "useEncountersContext").mockReturnValue({
            dispatch: mockDispatch,
            state: {
                encounters: [],
                isWalkthroughRunning: false,
            } as IEncounters,
        });
        jest.spyOn(UserContext, "useUserContext").mockReturnValue({
            state: mockUserState as IUserData,
            dispatch: jest.fn(),
        });
    });

    it("renders basic encounter information correctly", () => {
        render(
            <OEncounter
                encounterProfile={defaultEncounter}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        expect(
            screen.getByText(
                `${defaultEncounter.otherUser.firstName}, ${defaultEncounter.otherUser.age}`,
            ),
        ).toBeTruthy();
    });

    it("handles status change correctly", async () => {
        const mockUpdateStatus = jest
            .spyOn(API.encounter, "encounterControllerUpdateStatus")
            .mockResolvedValue({} as any);

        render(
            <OEncounter
                encounterProfile={defaultEncounter}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        const dropdown = screen.getByTestId("encounters-input-status");
        fireEvent.press(dropdown);

        fireEvent.press(screen.getByTestId("dropdown-option-met-interested"));

        expect(mockUpdateStatus).toHaveBeenCalledWith({
            updateEncounterStatusDTO: {
                encounterId: defaultEncounter.id,
                status: EncounterPublicDTOStatusEnum.met_interested,
            },
            userId: mockUserState.id,
        });
    });

    it("shows navigation button when nearby and approach is enabled", () => {
        const nearbyEncounter: EncounterPublicDTO = {
            ...defaultEncounter,
            isNearbyRightNow: true,
            status: EncounterPublicDTOStatusEnum.met_interested,
        };

        render(
            <OEncounter
                encounterProfile={nearbyEncounter}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        const navigateButton = screen.getByText("navigate");
        expect(navigateButton).toBeTruthy();
    });

    it("shows report button for met_not_interested status", () => {
        const notInterestedEncounter: EncounterPublicDTO = {
            ...defaultEncounter,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
        };

        render(
            <OEncounter
                encounterProfile={notInterestedEncounter}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        const reportButton = screen.getByText("report");
        expect(reportButton).toBeTruthy();
    });

    it("displays received message when available", () => {
        const mockMessage: MessagePublicDTO = {
            id: "msg1",
            content: "Hello there!",
            senderUserId: "other123",
            sentAt: new Date().toISOString(),
            // encounterId: 'encounter123'
        };

        const encounterWithMessage: EncounterPublicDTO = {
            ...defaultEncounter,
            status: EncounterPublicDTOStatusEnum.met_interested,
            messages: [mockMessage],
        };

        render(
            <OEncounter
                encounterProfile={encounterWithMessage}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        expect(screen.getByText("Hello there!")).toBeTruthy();
    });

    it("disables dropdown when encounter is reported", () => {
        const reportedEncounter: EncounterPublicDTO = {
            ...defaultEncounter,
            reported: true,
        };

        render(
            <OEncounter
                encounterProfile={reportedEncounter}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        const dropdown = screen.getByTestId("encounters-input-status");
        expect(dropdown.props.disable).toBeTruthy();
    });

    it("shows leave message button for met_interested status when not nearby", () => {
        const interestedEncounter: EncounterPublicDTO = {
            ...defaultEncounter,
            status: EncounterPublicDTOStatusEnum.met_interested,
            isNearbyRightNow: false,
        };

        render(
            <OEncounter
                encounterProfile={interestedEncounter}
                showActions={true}
                navigation={mockNavigation}
            />,
        );

        expect(screen.getByText("leaveMessageBtnLbl")).toBeTruthy();
    });
});
