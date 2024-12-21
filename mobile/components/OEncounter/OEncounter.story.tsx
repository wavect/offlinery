import {
    EncounterPublicDTO,
    EncounterPublicDTOStatusEnum,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTODateModeEnum,
    UserPrivateDTOVerificationStatusEnum,
} from "@/api/gen/src";
import {
    EACTION_ENCOUNTERS,
    EncountersContext,
} from "@/context/EncountersContext";
import { IUserData, UserContext } from "@/context/UserContext";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OEncounter from "./OEncounter";

// Create mock dispatch functions
const mockEncountersDispatch = (action: any) => {
    console.log("Encounters Dispatch called with:", action);
};

const mockUserDispatch = (action: any) => {
    console.log("User Dispatch called with:", action);
};

// Mock API function
const mockUpdateStatus = async () => {
    console.log("Status update called");
    return Promise.resolve();
};

// Mock API module
const mockAPI = {
    encounter: {
        encounterControllerUpdateStatus: mockUpdateStatus,
    },
};

// Mock user state
const mockUserState: IUserData = {
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

// Combined context wrapper component
const ContextWrapper = ({ children }: { children: React.ReactNode }) => (
    <UserContext.Provider
        value={{
            state: mockUserState,
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

const meta: Meta<typeof OEncounter> = {
    title: "Components/OEncounter",
    component: OEncounter,
    args: {
        showActions: true,
        navigation: {
            navigate: () => console.log("Navigation called"),
        },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 20, backgroundColor: "#fff" }}>
                <ContextWrapper>
                    <Story />
                </ContextWrapper>
            </View>
        ),
    ],
    parameters: {
        notes: "Encounter component displays user encounter information with various interaction states",
    },
};

export default meta;
type Story = StoryObj<typeof OEncounter>;

const baseEncounter: EncounterPublicDTO = {
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
        imageURIs: [
            "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
        ],
        intentions: [],
        bio: "No pick up lines please.",
    },
    messages: null,
};

// Helper function to handle status changes
const createPlayFunction = (status: EncounterPublicDTOStatusEnum) => {
    return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        console.log("Status would be updated to:", status);
        console.log("Action that would be dispatched:", {
            type: EACTION_ENCOUNTERS.UPDATE_MULTIPLE,
            payload: [
                {
                    id: baseEncounter.id,
                    status,
                },
            ],
        });
    };
};

export const Default: Story = {
    args: {
        encounterProfile: baseEncounter,
    },
    play: createPlayFunction(EncounterPublicDTOStatusEnum.met_interested),
};

export const WithMessage: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            status: EncounterPublicDTOStatusEnum.met_interested,
            messages: [
                {
                    id: "789",
                    content: "Hey, it was nice meeting you!",
                    sentAt: new Date().toISOString(),
                    senderUserId: "456",
                },
            ],
        },
    },
};

export const Reported: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
            reported: true,
        },
    },
};

export const NearbyRightNow: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            isNearbyRightNow: true,
        },
    },
};

export const NoActions: Story = {
    args: {
        encounterProfile: baseEncounter,
        showActions: false,
    },
};

export const MetInterested: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            status: EncounterPublicDTOStatusEnum.met_interested,
        },
    },
    play: createPlayFunction(EncounterPublicDTOStatusEnum.met_not_interested),
};

export const MetNotInterested: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
        },
    },
    play: createPlayFunction(EncounterPublicDTOStatusEnum.met_interested),
};

export const LongNames: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            otherUser: {
                ...baseEncounter.otherUser,
                firstName: "Alexandrina Victoria Augusta Louise",
            },
        },
    },
};

export const WithMultipleMessages: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            status: EncounterPublicDTOStatusEnum.met_interested,
            messages: [
                {
                    id: "789",
                    content: "Hey, it was nice meeting you!",
                    sentAt: new Date().toISOString(),
                    senderUserId: "456",
                },
                {
                    id: "790",
                    content: "Thanks, nice meeting you too!",
                    sentAt: new Date(Date.now() - 3600000).toISOString(),
                    senderUserId: "123",
                },
            ],
        },
    },
};

export const EmptyLocationNoMessages: Story = {
    args: {
        encounterProfile: {
            ...baseEncounter,
            lastLocationPassedBy: null,
            messages: [],
        },
    },
};
