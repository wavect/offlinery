// Mock user state
import React from "react";
import {
    EncounterPublicDTO,
    EncounterPublicDTOStatusEnum,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTODateModeEnum,
    UserPrivateDTOVerificationStatusEnum,
    UserPublicDTO,
    UserPublicDTOIntentionsEnum,
} from "../api/gen/src";
import { EncountersContext } from "../context/EncountersContext";
import { IUserData, UserContext } from "../context/UserContext";

const workingImageUris = [
    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
];

export const storybookMockUserData: IUserData = {
    id: "current-user-123",
    wantsEmailUpdates: false,
    email: "test@example.com",
    firstName: "Test User",
    clearPassword: "",
    birthDay: new Date(1990, 1, 1),
    imageURIs: {},
    verificationStatus: UserPrivateDTOVerificationStatusEnum.not_needed,
    approachChoice: UserPrivateDTOApproachChoiceEnum.both,
    blacklistedRegions: [],
    approachFromTime: new Date(),
    approachToTime: new Date(),
    bio: "Test bio",
    dateMode: UserPrivateDTODateModeEnum.ghost,
    markedForDeletion: false,
};

export const storybookMockUserPublic: UserPublicDTO = {
    id: "12",
    firstName: "Lisa",
    age: 28,
    bio: "Software engineer who loves hiking and photography",
    imageURIs: workingImageUris,
    intentions: [
        UserPublicDTOIntentionsEnum.casual,
        UserPublicDTOIntentionsEnum.relationship,
        UserPublicDTOIntentionsEnum.friendship,
    ],
};

export const storybookMockBaseEncounter: EncounterPublicDTO = {
    id: "123",
    status: EncounterPublicDTOStatusEnum.not_met,
    lastDateTimePassedBy: new Date().toISOString(),
    lastLocationPassedBy: "Central Park",
    reported: false,
    isNearbyRightNow: false,
    otherUser: {
        id: "456",
        firstName: "Jane",
        age: 25,
        imageURIs: workingImageUris,
        intentions: [
            UserPublicDTOIntentionsEnum.casual,
            UserPublicDTOIntentionsEnum.relationship,
            UserPublicDTOIntentionsEnum.friendship,
        ],
        bio: "No pick up lines please.",
    },
    messages: null,
    amountStreaks: 1,
};

// Create mock dispatch functions
const mockEncountersDispatch = (action: any) => {
    console.log("Encounters Dispatch called with:", action);
};

const mockUserDispatch = (action: any) => {
    console.log("User Dispatch called with:", action);
};

// Combined context wrapper component
export const StoryBookContextWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <UserContext.Provider
        value={{
            state: storybookMockUserData,
            dispatch: mockUserDispatch,
        }}
    >
        <EncountersContext.Provider
            value={{
                state: { encounters: [] },
                dispatch: mockEncountersDispatch,
            }}
        >
            {children}
        </EncountersContext.Provider>
    </UserContext.Provider>
);
