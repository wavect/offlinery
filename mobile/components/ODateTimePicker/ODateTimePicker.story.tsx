import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Platform, View } from "react-native";
import { EDateTimeFormatters, ODateTimePicker } from "./ODateTimePicker";

const meta: Meta<typeof ODateTimePicker> = {
    title: "Components/ODateTimePicker",
    component: ODateTimePicker,
    argTypes: {
        value: {
            control: "date",
            description: "Current date/time value",
        },
        mode: {
            control: "radio",
            options: ["date", "time"],
            description: "Picker mode - date or time selection",
        },
        dateTimeFormatter: {
            control: "radio",
            options: Object.values(EDateTimeFormatters),
            description: "Predefined formatter for date/time display",
        },
        minimumDate: {
            control: "date",
            description: "Minimum selectable date",
        },
        maximumDate: {
            control: "date",
            description: "Maximum selectable date",
        },
        minuteInterval: {
            control: "select",
            options: [1, 5, 10, 15, 30],
            description: "Interval between minutes in time picker",
        },
        androidTextStyle: {
            control: "object",
            description: "Style for the Android text display",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    minHeight: 200,
                    justifyContent: "center",
                }}
            >
                <Story />
            </View>
        ),
    ],
    parameters: {
        notes: `
      Platform-specific behavior:
      - iOS: Picker is embedded in the screen
      - Android: Opens as a modal dialog
    `,
    },
};

export default meta;

type Story = StoryObj<typeof ODateTimePicker>;

// Base date picker story
export const DefaultDatePicker: Story = {
    args: {
        value: new Date(),
        mode: "date",
        dateTimeFormatter: EDateTimeFormatters.DATE,
        androidTextStyle: {
            fontSize: 16,
            color: "#333",
            padding: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
        },
    },
};

// Time picker story
export const TimePicker: Story = {
    args: {
        ...DefaultDatePicker.args,
        mode: "time",
        dateTimeFormatter: EDateTimeFormatters.TIME,
        minuteInterval: 15,
    },
};

// Custom formatted date
export const CustomFormatted: Story = {
    args: {
        ...DefaultDatePicker.args,
        customFormatAndroidText: (date: Date) => {
            return `Selected: ${date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}`;
        },
    },
};

// Date range example
export const DateRange: Story = {
    args: {
        ...DefaultDatePicker.args,
        minimumDate: new Date(2024, 0, 1),
        maximumDate: new Date(2024, 11, 31),
    },
};

// Styled Android display
export const StyledAndroid: Story = {
    args: {
        ...DefaultDatePicker.args,
        androidTextStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: "#2196F3",
            padding: 12,
            backgroundColor: "#E3F2FD",
            borderRadius: 8,
            textAlign: "center",
        },
    },
};

// Platform specific display
export const PlatformSpecific: Story = {
    args: {
        ...DefaultDatePicker.args,
        display: Platform.select({
            ios: "spinner",
            android: "calendar",
            default: "default",
        }),
    },
};
