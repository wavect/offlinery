import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OTooltip } from "./OTooltip";

const meta: Meta<typeof OTooltip> = {
    title: "Components/OTooltip",
    component: OTooltip,
    argTypes: {
        tooltipText: {
            control: "text",
            description: "Text displayed inside the tooltip",
        },
        iconSize: {
            control: "number",
            description: "Size of the tooltip icon",
        },
        iconColor: {
            control: "color",
            description: "Color of the tooltip icon",
        },
        iconName: {
            control: "text",
            description: "Material Icon name for the tooltip trigger",
        },
        style: {
            description: "Additional styles for the tooltip container",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    alignItems: "center",
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

type Story = StoryObj<typeof OTooltip>;

export const Default: Story = {
    args: {
        tooltipText: "This is a tooltip!",
        iconName: "info",
    },
};

export const CustomIcon: Story = {
    args: {
        tooltipText: "Custom icon tooltip",
        iconName: "help",
        iconSize: 30,
        iconColor: "#007AFF",
    },
};

export const LongText: Story = {
    args: {
        tooltipText:
            "This is a long tooltip text to test how the tooltip handles multi-line text display and formatting.",
        iconName: "warning",
    },
};

export const DarkMode: Story = {
    args: {
        tooltipText: "Dark mode tooltip",
        iconName: "dark-mode",
        iconColor: "#FFF",
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
};
