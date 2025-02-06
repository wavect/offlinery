import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OTermsDisclaimer } from "./OTermsDisclaimer";

const meta: Meta<typeof OTermsDisclaimer> = {
    title: "Components/OTermsDisclaimer",
    component: OTermsDisclaimer,
    argTypes: {
        style: {
            description: "Custom styles for the disclaimer container",
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

type Story = StoryObj<typeof OTermsDisclaimer>;

export const Default: Story = {
    args: {},
};

export const CustomStyled: Story = {
    args: {
        style: {
            backgroundColor: "#e0e0e0",
            padding: 20,
            borderRadius: 10,
        },
    },
};

export const DarkBackground: Story = {
    decorators: [
        (Story) => (
            <View style={{ backgroundColor: "#333", padding: 16 }}>
                <Story />
            </View>
        ),
    ],
};
