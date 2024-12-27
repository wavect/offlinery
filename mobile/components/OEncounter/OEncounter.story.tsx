import {
    StoryBookContextWrapper,
    storybookMockBaseEncounter,
} from "@/.storybook/state.mocks";
import { EncounterPublicDTOStatusEnum } from "@/api/gen/src";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OEncounter from "./OEncounter";

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
                <StoryBookContextWrapper>
                    <Story />
                </StoryBookContextWrapper>
            </View>
        ),
    ],
    parameters: {
        notes: "Encounter component displays user encounter information with various interaction states",
    },
};

export default meta;
type Story = StoryObj<typeof OEncounter>;

export const Default: Story = {
    args: {
        encounterProfile: storybookMockBaseEncounter,
    },
};

export const WithMessage: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
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
            ...storybookMockBaseEncounter,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
            reported: true,
        },
    },
};

export const NearbyRightNow: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            isNearbyRightNow: true,
        },
    },
};

export const Strike1: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            amountStreaks: 1,
        },
    },
};

export const Strike2: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            amountStreaks: 2,
        },
    },
};

export const Strike10: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            amountStreaks: 10,
        },
    },
};

export const Strike100: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            amountStreaks: 100,
        },
    },
};

export const NoActions: Story = {
    args: {
        encounterProfile: storybookMockBaseEncounter,
        showActions: false,
    },
};

export const MetInterested: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            status: EncounterPublicDTOStatusEnum.met_interested,
        },
    },
};

export const MetNotInterested: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            status: EncounterPublicDTOStatusEnum.met_not_interested,
        },
    },
};

export const LongNames: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
            otherUser: {
                ...storybookMockBaseEncounter.otherUser,
                firstName: "Alexandrina Victoria Augusta Louise",
            },
        },
    },
};

export const WithMultipleMessages: Story = {
    args: {
        encounterProfile: {
            ...storybookMockBaseEncounter,
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
            ...storybookMockBaseEncounter,
            lastLocationPassedBy: null,
            messages: [],
        },
    },
};
