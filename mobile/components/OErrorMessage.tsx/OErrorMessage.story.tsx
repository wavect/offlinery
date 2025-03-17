import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OErrorMessage from "./OErrorMessage";

const meta: Meta<typeof OErrorMessage> = {
    title: "Components/OErrorMessage",
    component: OErrorMessage,
    argTypes: {
        errorMessage: {
            control: "text",
            description: "The error message to display",
        },
        show: {
            control: "boolean",
            description: "Controls whether the error message is shown",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 16, backgroundColor: "#f5f5f5" }}>
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OErrorMessage>;

export const Default: Story = {
    args: {
        errorMessage: "This is an error message.",
        show: true,
    },
};

export const Hidden: Story = {
    args: {
        errorMessage: "This message should not be visible.",
        show: false,
    },
};
