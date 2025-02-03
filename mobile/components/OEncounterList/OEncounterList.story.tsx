import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OEncounterList } from "./OEncounterList";

const meta: Meta<typeof OEncounterList> = {
    title: "Components/OEncounterList",
    component: OEncounterList,
    argTypes: {
        metStartDateFilter: {
            control: "date",
            description: "Start date filter for encounters",
        },
        metEndDateFilter: {
            control: "date",
            description: "End date filter for encounters",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ flex: 1, backgroundColor: "#f5f5f5", padding: 16 }}>
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OEncounterList>;

export const Default: Story = {
    args: {
        metStartDateFilter: new Date(
            new Date().setDate(new Date().getDate() - 7),
        ),
        metEndDateFilter: new Date(),
    },
};
