import { UserPrivateDTODateModeEnum } from "@/api/gen/src";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OHeatMap } from "./OHeatMap"; // Importiere die Komponente

const meta: Meta<typeof OHeatMap> = {
    title: "Components/OHeatMap",
    component: OHeatMap,
    argTypes: {
        showMap: {
            control: "boolean",
            description: "Flag to show or hide the heatmap",
        },
        userId: {
            control: "text",
            description: "User ID to fetch user-specific locations",
        },
        datingMode: {
            control: {
                type: "select",
                options: Object.values(UserPrivateDTODateModeEnum), // Enum-Werte anpassen
            },
            description:
                "The dating mode to adjust behavior (e.g., ghost, live)",
        },
        currentMapRegion: {
            control: "object",
            description: "Current map region for the heatmap to adjust to",
        },
        onLoadingStateChange: {
            action: "onLoadingStateChange",
            description: "Callback when the loading state changes",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    flex: 1,
                    justifyContent: "center",
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

type Story = StoryObj<typeof OHeatMap>;

// Standard Story für die OHeatMap-Komponente
export const Default: Story = {
    args: {
        showMap: true,
        userId: "user123",
        datingMode: UserPrivateDTODateModeEnum.live, // Ändere auf "live" oder einen anderen gültigen Wert
        currentMapRegion: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
    },
};

// Beispiel-Story für die OHeatMap-Komponente, bei der keine Karte angezeigt wird
export const NoMap: Story = {
    args: {
        showMap: false,
        userId: "user123",
        datingMode: UserPrivateDTODateModeEnum.ghost, // Ändere auf "ghost" oder einen anderen gültigen Wert
        currentMapRegion: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
    },
};

// Beispiel-Story mit einem anderen `datingMode`-Wert
export const GhostMode: Story = {
    args: {
        showMap: true,
        userId: "user456",
        datingMode: UserPrivateDTODateModeEnum.ghost, // Beispiel für den "ghost" Modus
        currentMapRegion: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
    },
};
