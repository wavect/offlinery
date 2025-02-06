import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text, View } from "react-native";
import { OLinearBackground } from "./OLinearBackground"; // Importiere die Komponente

const meta: Meta<typeof OLinearBackground> = {
    title: "Components/OLinearBackground",
    component: OLinearBackground,
    argTypes: {
        children: {
            control: "text",
            description: "Content to be rendered inside the background",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%", // Verwende "100%" für die Höhe
                }}
            >
                <Story />
            </View>
        ),
    ],
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

type Story = StoryObj<typeof OLinearBackground>;

// Standard Story für die OLinearBackground-Komponente
export const Default: Story = {
    args: {
        children: (
            <Text style={{ color: "#fff" }}>
                This is some content inside the linear gradient background!
            </Text>
        ),
    },
};

// Beispiel-Story ohne Text, nur mit Hintergrund
export const WithoutContent: Story = {
    args: {
        children: (
            <Text style={{ color: "#fff" }}>
                No content here, just background.
            </Text>
        ),
    },
};

// Beispiel mit anderem Hintergrund
export const CustomContent: Story = {
    args: {
        children: (
            <Text style={{ color: "#fff" }}>
                Custom content with linear background!
            </Text>
        ),
    },
};
