import { EmailCodeResponseADTO } from "@/api/gen/src";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OSplitInput } from "./OSplitInput";

const meta: Meta<typeof OSplitInput> = {
    title: "Components/OSplitInput",
    component: OSplitInput,
    argTypes: {
        sendCode: {
            action: "codeSent",
            description: "Callback for sending the code",
        },
        onCodeValidChange: {
            action: "codeValidChanged",
            description: "Callback when code validity changes",
        },
        onError: {
            action: "errorOccurred",
            description: "Callback when an error occurs",
        },
        sendCodeAutomatically: {
            control: "boolean",
            description:
                "If true, the code will be automatically sent when component mounts",
        },
        disableRequestCode: {
            control: "boolean",
            description: "Disables the resend code button",
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
};

export default meta;

type Story = StoryObj<typeof OSplitInput>;

// Default story with no code sent and no automatic sending
export const Default: Story = {
    args: {
        sendCode: async (): Promise<EmailCodeResponseADTO> => ({
            codeIssuedAt: new Date(),
            timeout: 60000, // 1 minute timeout for demonstration
        }),
        onCodeValidChange: (isValid: boolean, code: string) => {
            console.log(`Code valid: ${isValid}, entered code: ${code}`);
        },
        sendCodeAutomatically: false,
        disableRequestCode: false,
    },
};

// Automatically sending the code on mount
export const AutoSendCode: Story = {
    args: {
        ...Default.args,
        sendCodeAutomatically: true,
    },
};

// With an error message shown when code is invalid
export const WithError: Story = {
    args: {
        ...Default.args,
        sendCode: async (): Promise<EmailCodeResponseADTO> => {
            throw new Error("Failed to send code.");
        },
        onError: async () => {
            console.log("Error occurred while sending code.");
        },
    },
};

// Disable the resend code button (e.g., after timeout)
export const DisableResendButton: Story = {
    args: {
        ...Default.args,
        sendCode: async (): Promise<EmailCodeResponseADTO> => ({
            codeIssuedAt: new Date(),
            timeout: 60000, // 1 minute timeout for demonstration
        }),
        sendCodeAutomatically: true,
        disableRequestCode: true,
    },
};

// Resend code button with countdown timer
export const CountdownTimer: Story = {
    args: {
        ...Default.args,
        sendCode: async (): Promise<EmailCodeResponseADTO> => ({
            codeIssuedAt: new Date(),
            timeout: 60000, // 1 minute timeout for demonstration
        }),
        sendCodeAutomatically: false,
    },
};
