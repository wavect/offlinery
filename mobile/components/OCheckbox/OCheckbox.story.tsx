import { Color } from "@/GlobalStyles";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OCheckbox } from "./OCheckbox";

const meta: Meta<typeof OCheckbox> = {
    title: "Components/OCheckbox",
    component: OCheckbox,
    argTypes: {
        label: {
            control: "text",
            description: "Text label for the checkbox",
        },
        checkboxState: {
            control: "boolean",
            description: "Current state of the checkbox (checked/unchecked)",
        },
        onValueChange: {
            action: "changed",
            description: "Callback function when checkbox state changes",
        },
        style: {
            description: "Additional styles for the checkbox container",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    minWidth: 300,
                }}
            >
                <Story />
            </View>
        ),
    ],
    // Parameters can be used to set default backgrounds, viewport sizes, etc.
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

type Story = StoryObj<typeof OCheckbox>;

// Base story with default props
export const Default: Story = {
    args: {
        label: "Default Checkbox",
        checkboxState: false,
    },
};

// Checked state story
export const Checked: Story = {
    args: {
        ...Default.args,
        label: "Checked Checkbox",
        checkboxState: true,
    },
};

// Long label story to demonstrate text wrapping
export const LongLabel: Story = {
    args: {
        ...Default.args,
        label: "This is a very long checkbox label that demonstrates how the component handles text wrapping and multiple lines of content.",
    },
};

// Custom styled story
export const CustomStyled: Story = {
    args: {
        ...Default.args,
        label: "Custom Styled Checkbox",
        style: {
            backgroundColor: "#f0f0f0",
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Color.primary,
        },
    },
};

// Multiple checkboxes story using decorator
export const CheckboxGroup: StoryObj = {
    decorators: [
        (Story) => (
            <View style={{ gap: 16 }}>
                <OCheckbox
                    label="Option 1"
                    checkboxState={false}
                    onValueChange={() => {}}
                />
                <OCheckbox
                    label="Option 2"
                    checkboxState={true}
                    onValueChange={() => {}}
                />
                <OCheckbox
                    label="Option 3"
                    checkboxState={false}
                    onValueChange={() => {}}
                />
            </View>
        ),
    ],
};

// RTL (Right-to-Left) support demonstration
export const RTLSupport: Story = {
    args: {
        ...Default.args,
        label: "RTL Checkbox Example",
    },
    decorators: [
        (Story) => (
            <View style={{ direction: "rtl" }}>
                <Story />
            </View>
        ),
    ],
};
