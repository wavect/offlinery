import { Color } from "@/GlobalStyles";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native"; // Statt `div` jetzt `View`
import { OShowcase } from "./OShowcase";

const meta: Meta<typeof OShowcase> = {
    title: "Components/OShowcase",
    component: OShowcase,
    argTypes: {
        subtitle: {
            control: "text",
            description: "Subtitle text to display below the headline",
        },
        onlyUseSystemFont: {
            control: "boolean",
            description: "Whether to use system font only for the text",
        },
        containerStyle: {
            control: "object",
            description: "Custom styles for the container",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ backgroundColor: "#333", padding: 20 }}>
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OShowcase>;

export const Default: Story = {
    args: {
        subtitle: "This is a subtitle example.",
        onlyUseSystemFont: false,
    },
};

export const WithSystemFont: Story = {
    args: {
        ...Default.args,
        onlyUseSystemFont: true,
        subtitle: "Subtitle using system font only.",
    },
};

export const CustomContainerStyle: Story = {
    args: {
        ...Default.args,
        containerStyle: {
            backgroundColor: Color.primary,
            borderRadius: 12,
            padding: 20,
        },
    },
};

export const LongSubtitle: Story = {
    args: {
        ...Default.args,
        subtitle:
            "This is a longer subtitle to demonstrate text wrapping and multiline functionality for the OShowcase component.",
    },
};

export const WithIcon: Story = {
    args: {
        ...Default.args,
        subtitle: "Subtitle with an icon in the headline.",
    },
};
