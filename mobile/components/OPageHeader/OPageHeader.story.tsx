import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OPageHeader } from "./OPageHeader";

const meta: Meta<typeof OPageHeader> = {
    title: "Components/OPageHeader",
    component: OPageHeader,
    argTypes: {
        title: {
            control: "text",
            description: "Title of the page header",
        },
        onHelpPress: {
            action: "helpPressed",
            description: "Callback function when help button is pressed",
        },
        highlightHelpBtn: {
            control: "boolean",
            description: "Whether the help button should be animated",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 20,
                    backgroundColor: "#f5f5f5",
                    minWidth: 320,
                }}
            >
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OPageHeader>;

// Default story without highlighting help button
export const Default: Story = {
    args: {
        title: "Page Header",
        onHelpPress: () => {
            console.log("Help pressed");
        },
    },
};

// Story with animated help button (highlighted)
export const HighlightedHelpButton: Story = {
    args: {
        title: "Page Header with Animated Help Button",
        onHelpPress: () => {
            console.log("Help pressed");
        },
        highlightHelpBtn: true,
    },
};

// Story with no help button (disabled)
export const NoHelpButton: Story = {
    args: {
        title: "Page Header without Help Button",
    },
};
