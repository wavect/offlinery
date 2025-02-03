import { Color } from "@/GlobalStyles";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
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
            <div style={{ backgroundColor: "#333", padding: "20px" }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OShowcase>;

// Default story with a simple subtitle and no system font
export const Default: Story = {
    args: {
        subtitle: "This is a subtitle example.",
        onlyUseSystemFont: false,
    },
};

// Story with system font only
export const WithSystemFont: Story = {
    args: {
        ...Default.args,
        onlyUseSystemFont: true,
        subtitle: "Subtitle using system font only.",
    },
};

// Story with custom container style
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

// Story with a longer subtitle
export const LongSubtitle: Story = {
    args: {
        ...Default.args,
        subtitle:
            "This is a longer subtitle to demonstrate text wrapping and multiline functionality for the OShowcase component.",
    },
};

// Story with a headline icon (using the default icon)
export const WithIcon: Story = {
    args: {
        ...Default.args,
        subtitle: "Subtitle with an icon in the headline.",
    },
};
