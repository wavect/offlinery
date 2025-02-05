import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OTextInput } from "./OTextInput";

const meta: Meta<typeof OTextInput> = {
    title: "Components/OTextInput",
    component: OTextInput,
    argTypes: {
        topLabel: {
            control: "text",
            description: "Label displayed above the input field",
        },
        bottomLabel: {
            control: "text",
            description: "Label displayed below the input field",
        },
        isBottomLabelError: {
            control: "boolean",
            description:
                "If true, bottom label will be styled as an error message",
        },
        isSensitiveInformation: {
            control: "boolean",
            description: "If true, toggles password visibility",
        },
        showCharacterCount: {
            control: "boolean",
            description: "If true, displays the character count",
        },
        maxLength: {
            control: "number",
            description: "Maximum allowed characters in the input field",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    width: "100%",
                }}
            >
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OTextInput>;

export const Default: Story = {
    args: {
        topLabel: "Username",
        bottomLabel: "Enter your username",
    },
};

export const PasswordInput: Story = {
    args: {
        topLabel: "Password",
        bottomLabel: "Must be at least 8 characters",
        isSensitiveInformation: true,
    },
};

export const ErrorState: Story = {
    args: {
        topLabel: "Email",
        bottomLabel: "Invalid email address",
        isBottomLabelError: true,
    },
};

export const WithCharacterCount: Story = {
    args: {
        topLabel: "Bio",
        bottomLabel: "Tell us about yourself",
        showCharacterCount: true,
        maxLength: 100,
    },
};
