import { Color } from "@/GlobalStyles";
import { OLoadingSpinner } from "@/components/OLoadingCircle/OLoadingCircle";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";

const meta: Meta<typeof OLoadingSpinner> = {
    title: "Components/OLoadingSpinner",
    component: OLoadingSpinner,
    argTypes: {
        size: {
            control: { type: "number" },
            description: "Size of the spinner in pixels",
        },
        color: {
            control: { type: "color" },
            description: "Color of the spinner",
        },
        text: {
            control: { type: "text" },
            description: "Optional loading text below the spinner",
        },
        duration: {
            control: { type: "number" },
            description: "Duration of one complete rotation in milliseconds",
        },
        isVisible: {
            control: { type: "boolean" },
            description: "Controls the visibility of the spinner",
        },
    },
    args: {
        size: 40,
        color: Color.primary,
        duration: 1000,
        isVisible: true,
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OLoadingSpinner>;

export const Default: Story = {
    args: {
        text: "Loading...",
    },
};

export const Large: Story = {
    args: {
        size: 80,
        text: "Loading...",
    },
};

export const CustomColor: Story = {
    args: {
        color: "#FF0000",
        text: "Processing...",
    },
};

export const FastSpin: Story = {
    args: {
        duration: 500,
        text: "Loading...",
    },
};

export const TextOnly: Story = {
    args: {
        text: "Please wait...",
        textStyle: {
            fontSize: 20,
            color: "#000",
        },
    },
};

export const CustomContainer: Story = {
    args: {
        text: "Loading...",
        containerStyle: {
            backgroundColor: "#f5f5f5",
            padding: 20,
            borderRadius: 10,
        },
    },
};

export const Hidden: Story = {
    args: {
        isVisible: false,
    },
};
