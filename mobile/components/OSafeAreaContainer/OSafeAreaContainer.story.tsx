import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text, View } from "react-native";
import { OSafeAreaContainer } from "./OSafeAreaContainer";

const meta: Meta<typeof OSafeAreaContainer> = {
    title: "Components/OSafeAreaContainer",
    component: OSafeAreaContainer,
    argTypes: {
        containerStyle: {
            control: "object",
            description: "Custom styles for the container",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#eee",
                }}
            >
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OSafeAreaContainer>;

// Default story without custom styling
export const Default: Story = {
    args: {
        children: (
            <View style={{ backgroundColor: "#fff", padding: 16 }}>
                <Text>This is the content inside the safe area container.</Text>
            </View>
        ),
    },
};

// Custom container style story
export const CustomContainerStyle: Story = {
    args: {
        children: (
            <View style={{ backgroundColor: "#fff", padding: 16 }}>
                <Text>
                    This container has custom padding and background color.
                </Text>
            </View>
        ),
        containerStyle: {
            backgroundColor: "#00bcd4",
            padding: 32,
            borderRadius: 12,
        },
    },
};

// Story with additional children components
export const WithMultipleChildren: Story = {
    args: {
        children: (
            <View style={{ backgroundColor: "#fff", padding: 16 }}>
                <Text>This is the first child component.</Text>
                <Text>
                    This is the second child component inside the safe area
                    container.
                </Text>
            </View>
        ),
    },
};

// Story with no custom styling, just safe area insets applied
export const NoCustomStyle: Story = {
    args: {
        children: (
            <View style={{ backgroundColor: "#fff", padding: 16 }}>
                <Text>
                    No custom styles are applied here, just safe area insets.
                </Text>
            </View>
        ),
        containerStyle: {},
    },
};
