import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OButtonWide } from "./OButtonWide";

const meta: Meta<typeof OButtonWide> = {
    title: "Components/OButtonWide",
    component: OButtonWide,
    argTypes: {
        text: {
            control: "text",
            description: "Button text content",
        },
        filled: {
            control: "boolean",
            description: "Whether the button has a filled background",
        },
        variant: {
            control: "radio",
            options: ["dark", "light"],
            description: "Color variant of the button",
        },
        disabled: {
            control: "boolean",
            description: "Disable button interactions",
        },
        isLoading: {
            control: "boolean",
            description: "Show loading state",
        },
        loadingBtnText: {
            control: "text",
            description: "Alternative text to show during loading",
        },
        size: {
            control: "radio",
            options: ["default", "smaller"],
            description: "Button size variant",
        },
        countdownEnableSeconds: {
            control: "number",
            description: "Enable countdown timer (in seconds)",
        },
        numberOfLines: {
            control: "number",
            description: "Maximum number of text lines",
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

type Story = StoryObj<typeof OButtonWide>;

// Base story with default props
export const Default: Story = {
    args: {
        text: "Click Me",
        filled: true,
        variant: "dark",
    },
};

// Filled variant stories
export const FilledDark: Story = {
    args: {
        ...Default.args,
        text: "Filled Dark Button",
        variant: "dark",
        filled: true,
    },
};

export const FilledLight: Story = {
    args: {
        ...Default.args,
        text: "Filled Light Button",
        variant: "light",
        filled: true,
    },
};

// Outlined variant stories
export const OutlinedDark: Story = {
    args: {
        ...Default.args,
        text: "Outlined Dark Button",
        variant: "dark",
        filled: false,
    },
};

export const OutlinedLight: Story = {
    args: {
        ...Default.args,
        text: "Outlined Light Button",
        variant: "light",
        filled: false,
    },
};

// State stories
export const Disabled: Story = {
    args: {
        ...Default.args,
        text: "Disabled Button",
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        ...Default.args,
        text: "Loading Button",
        isLoading: true,
        loadingBtnText: "Loading...",
    },
};

export const WithCountdown: Story = {
    args: {
        ...Default.args,
        text: "Countdown Button",
        countdownEnableSeconds: 5,
    },
};

// Size variant stories
export const SmallerSize: Story = {
    args: {
        ...Default.args,
        text: "Smaller Button",
        size: "smaller",
    },
};

// Long text handling
export const LongText: Story = {
    args: {
        ...Default.args,
        text: "This is a very long button text that may need to wrap to multiple lines",
        numberOfLines: 2,
    },
};
