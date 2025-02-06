import { UserProvider } from "@/context/UserContext"; // Der Import des UserProviders
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import MapView from "react-native-maps";
import { OBlacklistedRegion } from "./OBlacklistedRegion"; // Dein Komponentimport

// Beispielregion für die Karte
const exampleRegion = {
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
            <UserProvider>
                {/* Umgibt die Story mit dem UserProvider */}
                <View style={{ flex: 1 }}>
                    <MapView
                        style={{ flex: 1, width: "100%", height: "100%" }}
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
            </UserProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OBlacklistedRegion>;

// Standard-Story
export const Default: Story = {
    args: {
        isSelected: false,
        region: exampleRegion,
        handleRegionPress: () => console.log("Region gedrückt"),
    },
};

// Story mit ausgewählter Region
export const SelectedRegion: Story = {
    args: {
        isSelected: true,
        region: exampleRegion,
        handleRegionPress: () => console.log("Ausgewählte Region gedrückt"),
    },
};

// Benutzerdefinierte Region
export const CustomRegion: Story = {
    args: {
        isSelected: false,
        region: { latitude: 40.7128, longitude: -74.006, radius: 700 },
        handleRegionPress: () =>
            console.log("Benutzerdefinierte Region gedrückt"),
    },
};
