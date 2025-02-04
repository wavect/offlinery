import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text, View } from "react-native"; // Importiere View für React Native
import { OPageColorContainer } from "./OPageColorContainer";

const meta: Meta<typeof OPageColorContainer> = {
    title: "Components/OPageColorContainer",
    component: OPageColorContainer,
    argTypes: {
        isLoading: {
            control: "boolean",
            description: "Controls the loading state of the container",
        },
        children: {
            control: "text",
            description: "Content to display inside the container",
        },
        refreshFunc: {
            action: "refreshed",
            description: "Function to refresh the page",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 20, backgroundColor: "transparent" }}>
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OPageColorContainer>;

export const Default: Story = {
    args: {
        isLoading: false,
        children: <Text>Page content goes here.</Text>,
    },
};

export const LoadingState: Story = {
    args: {
        isLoading: true,
        children: (
            <Text>Content that will be replaced by the loading screen.</Text>
        ),
    },
};

export const RefreshablePage: Story = {
    args: {
        isLoading: false,
        refreshFunc: async () => {
            console.log("Page refreshed!");
        },
        children: <Text>Pull down to refresh the page content.</Text>,
    },
};
