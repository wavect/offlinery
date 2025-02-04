import { OEncounterList } from "@/components/OEncounterList/OEncounterList";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";

// Mocked data for testing purposes
const mockEncounters = [
    {
        id: "1",
        name: "John Doe",
        date: "2025-02-01",
        location: "New York",
    },
    {
        id: "2",
        name: "Jane Smith",
        date: "2025-02-02",
        location: "Los Angeles",
    },
];

// Meta configuration for the OEncounterList component
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

type Story = StoryObj<typeof OEncounterList>;

// Default story
export const Default: Story = {
    args: {
        metStartDateFilter: new Date("2025-01-01"),
        metEndDateFilter: new Date("2025-12-31"),
    },
};

// Story for when no encounters are available
export const NoEncounters: Story = {
    args: {
        metStartDateFilter: new Date("2025-01-01"),
        metEndDateFilter: new Date("2025-12-31"),
    },
};

// Story for showing loading state
export const Loading: Story = {
    args: {
        metStartDateFilter: new Date("2025-01-01"),
        metEndDateFilter: new Date("2025-12-31"),
    },
};

// Story for walkthrough running state
export const WalkthroughRunning: Story = {
    args: {
        metStartDateFilter: new Date("2025-01-01"),
        metEndDateFilter: new Date("2025-12-31"),
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
};

// Story with dynamic date range
export const WithDynamicDates: Story = {
    args: {
        metStartDateFilter: new Date("2025-01-01"),
        metEndDateFilter: new Date("2025-12-31"),
    },
    argTypes: {
        metStartDateFilter: {
            control: "date",
            description: "Start date for filtering encounters",
        },
        metEndDateFilter: {
            control: "date",
            description: "End date for filtering encounters",
        },
    },
};
