import { Color } from "@/GlobalStyles";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OImageWithLoader } from "./OImageWithLoader";

const meta: Meta<typeof OImageWithLoader> = {
    title: "Components/OImageWithLoader",
    component: OImageWithLoader,
    argTypes: {
        source: {
            control: "object",
            description: "Image source object with URI",
        },
        style: {
            control: "object",
            description: "Style object for the image container",
        },
        showLoadingIndicator: {
            control: "boolean",
            description: "Whether to show the loading indicator",
        },
        resizeMode: {
            control: {
                type: "select",
                options: ["cover", "contain", "stretch", "center"],
            },
            description: "Image resize mode",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 20,
                    backgroundColor: "#f5f5f5",
                }}
            >
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OImageWithLoader>;

// Valid image URL
const validImageUrl = {
    uri: "https://picsum.photos/400/300",
};

// Invalid image URL to trigger error state
const invalidImageUrl = {
    uri: "https://invalid-image-url.com/image.jpg",
};

// Base style for demo purposes
const baseImageStyle = {
    width: 300,
    height: 200,
    borderRadius: 8,
};

export const Default: Story = {
    args: {
        source: validImageUrl,
        style: baseImageStyle,
        resizeMode: "cover",
    },
};

export const CustomSize: Story = {
    args: {
        source: validImageUrl,
        style: {
            ...baseImageStyle,
            width: 400,
            height: 300,
        },
        resizeMode: "cover",
    },
};

export const RoundedImage: Story = {
    args: {
        source: validImageUrl,
        style: {
            ...baseImageStyle,
            borderRadius: 100, // Makes it very round
        },
        resizeMode: "cover",
    },
};

export const ContainMode: Story = {
    args: {
        source: validImageUrl,
        style: baseImageStyle,
        resizeMode: "contain",
    },
};

export const ErrorState: Story = {
    args: {
        source: invalidImageUrl,
        style: baseImageStyle,
        resizeMode: "cover",
    },
};

export const SmallImage: Story = {
    args: {
        source: validImageUrl,
        style: {
            ...baseImageStyle,
            width: 150,
            height: 100,
        },
        resizeMode: "cover",
    },
};

// Example with a local image (for demonstration)
export const LocalImage: Story = {
    args: {
        source: require("@/assets/lisa-example.jpg"), // You'll need to replace this with an actual local image
        style: baseImageStyle,
        resizeMode: "cover",
    },
};

// Mock the loading state
export const LoadingState: Story = {
    args: {
        source: {
            uri: "https://picsum.photos/4000/4000", // Large image to ensure loading state is visible
        },
        style: baseImageStyle,
        resizeMode: "cover",
    },
};

// Custom styling for container and loader
export const CustomStyling: Story = {
    args: {
        source: validImageUrl,
        style: {
            ...baseImageStyle,
            backgroundColor: "#e0e0e0",
            borderWidth: 2,
            borderColor: Color.primary,
        },
        resizeMode: "cover",
    },
};
