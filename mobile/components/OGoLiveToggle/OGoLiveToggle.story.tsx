import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OGoLiveToggle } from "./OGoLiveToggle";

const meta: Meta<typeof OGoLiveToggle> = {
    title: "Components/OGoLiveToggle",
    component: OGoLiveToggle,
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    alignItems: "center",
                    justifyContent: "center",
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

type Story = StoryObj<typeof OGoLiveToggle>;

export const Default: Story = {
    args: {},
};
