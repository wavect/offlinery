import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text, View } from "react-native";
import OCard from "./OCard";

const meta: Meta<typeof OCard> = {
    title: "Components/OCard",
    component: OCard,
    argTypes: {
        dismissable: {
            control: "boolean",
            description: "Allows dismissing the card",
        },
        initiallyVisible: {
            control: "boolean",
            description: "Determines if the card is initially visible",
        },
        onDismiss: {
            action: "dismissed",
            description: "Callback when the card is dismissed",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                }}
            >
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OCard>;

export const Default: Story = {
    args: {
        dismissable: true,
        initiallyVisible: true,
        children: <Text>This is a card component</Text>,
    },
};
