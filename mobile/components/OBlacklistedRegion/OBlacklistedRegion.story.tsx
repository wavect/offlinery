import { MapRegion } from "@/context/UserContext";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import MapView from "react-native-maps";
import { OBlacklistedRegion } from "./OBlacklistedRegion";

const exampleRegion: MapRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 500,
};

const meta: Meta<typeof OBlacklistedRegion> = {
    title: "Components/OBlacklistedRegion",
    component: OBlacklistedRegion,
    argTypes: {
        isSelected: {
            control: "boolean",
            description: "Gibt an, ob die Region ausgewählt ist.",
        },
        region: {
            control: "object",
            description:
                "Definiert die Region mit Latitude, Longitude und Radius.",
        },
        handleRegionPress: {
            action: "handleRegionPress",
            description: "Wird aufgerufen, wenn die Region angeklickt wird.",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ flex: 1 }}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: exampleRegion.latitude,
                        longitude: exampleRegion.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    <Story />
                </MapView>
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

type Story = StoryObj<typeof OBlacklistedRegion>;

export const Default: Story = {
    args: {
        isSelected: false,
        region: exampleRegion,
        handleRegionPress: () => console.log("Region gedrückt"),
    },
};

export const SelectedRegion: Story = {
    args: {
        isSelected: true,
        region: exampleRegion,
        handleRegionPress: () => console.log("Ausgewählte Region gedrückt"),
    },
};

export const CustomRegion: Story = {
    args: {
        isSelected: false,
        region: { latitude: 40.7128, longitude: -74.006, radius: 700 },
        handleRegionPress: () =>
            console.log("Benutzerdefinierte Region gedrückt"),
    },
};
