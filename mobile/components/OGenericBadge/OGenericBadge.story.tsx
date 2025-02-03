import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OGenericBadge from "./OGenericBadge";

const meta: Meta<typeof OGenericBadge> = {
    title: "Components/OGenericBadge",
    component: OGenericBadge,
    argTypes: {
        label: {
            control: "text",
            description: "Text label inside the badge",
        },
        description: {
            control: "text",
            description: "Description text displayed in the modal",
        },
        icon: {
            control: "text",
            description: "MaterialIcon name",
        },
        backgroundColor: {
            control: "color",
            description: "Background color of the badge",
        },
    },
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
};

export default meta;

type Story = StoryObj<typeof OGenericBadge>;

export const Default: Story = {
    args: {
        label: "Badge Label",
        description: "This is a description inside the modal.",
        icon: "info",
        backgroundColor: "#007AFF",
    },
};

export const WithoutLabel: Story = {
    args: {
        label: "",
        description: "This is a description inside the modal.",
        icon: "info",
        backgroundColor: "#FF5733",
    },
};

export const CustomIcon: Story = {
    args: {
        label: "Custom Icon",
        description: "This badge has a different icon.",
        icon: "star",
        backgroundColor: "#4CAF50",
    },
};
