import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OAgeRangeSlider from "./OAgeRangeSlider";

const meta: Meta<typeof OAgeRangeSlider> = {
    title: "Components/AgeRangeSlider",
    component: OAgeRangeSlider,
    argTypes: {
        onChange: { action: "range changed" },
        value: {
            control: {
                type: "object",
            },
        },
        showValues: {
            control: {
                type: "boolean",
            },
        },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 20, height: 100 }}>
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OAgeRangeSlider>;

export const Default: Story = {
    args: {
        value: [25, 45],
        showValues: true,
    },
};

export const WithoutValues: Story = {
    args: {
        value: [30, 50],
        showValues: false,
    },
};

export const ExtremesSelected: Story = {
    args: {
        value: [18, 100],
        showValues: true,
    },
};

export const NarrowRange: Story = {
    args: {
        value: [35, 40],
        showValues: true,
    },
};
