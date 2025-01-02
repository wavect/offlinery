import { NavigationContainer } from "@react-navigation/native";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import AppIntroduction from "../AppIntroductionSlider";

// Mock navigation prop
const mockNavigation: any = {
    navigate: () => {},
};

const meta: Meta<typeof AppIntroduction> = {
    title: "Screens/AppIntroduction",
    component: AppIntroduction,
    decorators: [
        (Story) => (
            <NavigationContainer>
                <Story />
            </NavigationContainer>
        ),
    ],
    parameters: {
        // Optional parameters
        backgrounds: {
            default: "dark",
        },
    },
    // Mock the required props
    args: {
        navigation: mockNavigation,
    },
};

export default meta;

type Story = StoryObj<typeof AppIntroduction>;

export const Default: Story = {
    args: {
        // You can override default args here if needed
    },
};

// Example of a story with different navigation behavior
export const WithCustomNavigation: Story = {
    args: {
        navigation: {
            ...mockNavigation,
            navigate: (route: string) => {
                console.log(`Navigating to: ${route}`);
            },
        },
    },
};
