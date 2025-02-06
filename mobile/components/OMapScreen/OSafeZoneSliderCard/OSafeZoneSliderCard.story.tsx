import { UserProvider } from "@/context/UserContext"; // Stelle sicher, dass der Pfad korrekt ist
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OSafeZoneSliderCard } from "./OSafeZoneSliderCard"; // Stelle sicher, dass der Pfad korrekt ist

const meta: Meta<typeof OSafeZoneSliderCard> = {
    title: "Components/OSafeZoneSliderCard",
    component: OSafeZoneSliderCard,
    argTypes: {
        handleRadiusChange: { action: "handleRadiusChange" },
        handleRemoveRegion: { action: "handleRemoveRegion" },
        activeRegionIndex: {
            control: "number",
            description: "The index of the active region",
        },
        sliderValue: {
            control: "number",
            description: "The value of the slider",
        },
        containerStyle: {
            control: "object",
            description: "Custom styles for the container",
        },
    },
    decorators: [
        (Story) => (
            <UserProvider>
                <View
                    style={{
                        padding: 16,
                        backgroundColor: "#f5f5f5",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Story />
                </View>
            </UserProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OSafeZoneSliderCard>;

// Default Story
export const Default: Story = {
    args: {
        handleRadiusChange: (value: number) => {},
        handleRemoveRegion: () => {},
        activeRegionIndex: 0,
        sliderValue: 500,
        containerStyle: {},
    },
};

// Story with Custom Slider Value
export const CustomSliderValue: Story = {
    args: {
        handleRadiusChange: (value: number) => {},
        handleRemoveRegion: () => {},
        activeRegionIndex: 1,
        sliderValue: 1000,
        containerStyle: {},
    },
};

// Story with Custom Container Style
export const CustomContainerStyle: Story = {
    args: {
        handleRadiusChange: (value: number) => {},
        handleRemoveRegion: () => {},
        activeRegionIndex: 2,
        sliderValue: 1500,
        containerStyle: {
            backgroundColor: "#e0e0e0",
            padding: 20,
        },
    },
};
