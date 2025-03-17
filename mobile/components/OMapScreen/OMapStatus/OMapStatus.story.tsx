import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { EMapStatus, OMapStatus } from "./OMapStatus"; // Importiere die Komponente

const meta: Meta<typeof OMapStatus> = {
    title: "Components/OMapStatus",
    component: OMapStatus,
    argTypes: {
        status: {
            control: {
                type: "select",
                options: Object.values(EMapStatus), // Ermöglicht es, zwischen den Statuswerten zu wechseln
            },
            description: "Status of the map component",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    alignItems: "center",
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

type Story = StoryObj<typeof OMapStatus>;

// Standard Story mit einem Beispiel für den "Live"-Status
export const Default: Story = {
    args: {
        status: EMapStatus.LIVE,
    },
};

// Beispiel-Story für den "Loading Heatmap"-Status
export const LoadingHeatmap: Story = {
    args: {
        status: EMapStatus.LOADING_HEATMAP,
    },
};

// Beispiel-Story für den "Saving Safezones"-Status
export const SavingSafezones: Story = {
    args: {
        status: EMapStatus.SAVING_SAFEZONES,
    },
};

// Beispiel-Story für den "Ghost Mode"-Status
export const GhostMode: Story = {
    args: {
        status: EMapStatus.GHOST,
    },
};

// Beispiel-Story für den "Error"-Status
export const ErrorStatus: Story = {
    args: {
        status: EMapStatus.ERROR,
    },
};
