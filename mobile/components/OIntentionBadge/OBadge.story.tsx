import { UserPublicDTOIntentionsEnum } from "@/api/gen/src";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OIntentionBadge from "./OIntentionBadge";

const meta = {
    title: "Components/OBadge",
    component: OIntentionBadge,
    parameters: {
        docs: {
            description: {
                component:
                    "A badge component that displays different intentions with corresponding icons and colors. Tapping the badge shows a modal with more details.",
            },
        },
    },
    argTypes: {
        intention: {
            control: "select",
            options: Object.values(UserPublicDTOIntentionsEnum),
            description:
                "The intention type that determines the badge appearance",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 16, backgroundColor: "#f5f5f5" }}>
                <Story />
            </View>
        ),
    ],
    tags: ["autodocs"],
} satisfies Meta<typeof OIntentionBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        intention: UserPublicDTOIntentionsEnum.casual,
    },
};

export const AllBadges: Story = {
    render: () => (
        <View style={{ gap: 8 }}>
            <OIntentionBadge intention={UserPublicDTOIntentionsEnum.casual} />
            <OIntentionBadge
                intention={UserPublicDTOIntentionsEnum.friendship}
            />
            <OIntentionBadge
                intention={UserPublicDTOIntentionsEnum.relationship}
            />
        </View>
    ),
};

export const CasualBadge: Story = {
    args: {
        intention: UserPublicDTOIntentionsEnum.casual,
    },
    parameters: {
        docs: {
            description: {
                story: "Badge displaying casual intention with teal background.",
            },
        },
    },
};

export const FriendshipBadge: Story = {
    args: {
        intention: UserPublicDTOIntentionsEnum.friendship,
    },
    parameters: {
        docs: {
            description: {
                story: "Badge displaying friendship intention with blue background.",
            },
        },
    },
};

export const RelationshipBadge: Story = {
    args: {
        intention: UserPublicDTOIntentionsEnum.relationship,
    },
    parameters: {
        docs: {
            description: {
                story: "Badge displaying relationship intention with purple background.",
            },
        },
    },
};
