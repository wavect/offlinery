import { MaterialIcons } from "@expo/vector-icons"; // Importiere MaterialIcons
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native"; // Vergiss nicht, View zu importieren
import { OLabel } from "./OLabel"; // Importiere die Komponente

const meta: Meta<typeof OLabel> = {
    title: "Components/OLabel",
    component: OLabel,
    argTypes: {
        text: {
            control: "text",
            description: "Label text to display",
        },
        tooltipText: {
            control: "text",
            description: "Tooltip text to display when hovering over the icon",
        },
        iconName: {
            control: {
                type: "select",
                options: Object.keys(MaterialIcons.glyphMap), // Ermöglicht es, zwischen den Symbolen auszuwählen
            },
            description: "Icon to display alongside the label",
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

type Story = StoryObj<typeof OLabel>;

// Standard Story für die OLabel-Komponente
export const Default: Story = {
    args: {
        text: "Label Text",
        tooltipText: "This is the tooltip text.",
    },
};

// Beispiel-Story ohne Tooltip
export const WithoutTooltip: Story = {
    args: {
        text: "Label Text without Tooltip",
        tooltipText: "",
    },
};

// Beispiel mit einem anderen Icon
export const CustomIcon: Story = {
    args: {
        text: "Label with Custom Icon",
        tooltipText: "This is a custom icon tooltip.",
        iconName: "info-outline",
    },
};
