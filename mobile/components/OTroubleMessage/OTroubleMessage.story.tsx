import { OTroubleMessage } from "@/components/OTroubleMessage/OTroubleMessage";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";

const meta: Meta<typeof OTroubleMessage> = {
    title: "Components/OTroubleMessage",
    component: OTroubleMessage,
    argTypes: {
        label: {
            control: "text",
            description: "The label displayed in the message",
        },
        action: {
            action: "pressed",
            description: "Action triggered when the text is pressed",
        },
        style: {
            control: "object",
            description: "Additional custom styles for the text",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    alignItems: "center",
                    flex: 1,
                }}
            >
                <Story />
            </View>
        ),
    ],
    parameters: {
        backgrounds: {
            default: "light",
            values: [
                { name: "light", value: "#FFFFFF" },
                { name: "dark", value: "#333333" },
            ],
        },
    },
};

export default meta;

type Story = StoryObj<typeof OTroubleMessage>;

// Default story with a basic label
export const Default: Story = {
    args: {
        label: "Contact support for help",
        action: () => console.log("Contact support clicked"),
    },
};

// Story with custom text and style
export const CustomMessage: Story = {
    args: {
        label: "Something went wrong. Tap to try again.",
        action: () => console.log("Try again clicked"),
        style: { color: "#FF6347", fontSize: 18 }, // Custom style
    },
};

// Story to demonstrate interaction (this will trigger a console log when clicked)
export const Interactive: Story = {
    args: {
        label: "Click here to take action!",
        action: () => alert("Action performed!"),
    },
};
