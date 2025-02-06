import { EncountersProvider } from "@/context/EncountersContext"; // Importiere den Provider!
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OTourEncounter } from "./OTourEncounter";

const meta: Meta<typeof OTourEncounter> = {
    title: "Components/OTourEncounter",
    component: OTourEncounter,
    decorators: [
        (Story) => (
            <EncountersProvider>
                {" "}
                {/* ✅ Jetzt umschließt der Provider die Story */}
                <View style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
                    <Story />
                </View>
            </EncountersProvider>
        ),
    ],
    parameters: {
        backgrounds: {
            default: "dark",
            values: [
                { name: "light", value: "#FFFFFF" },
                { name: "dark", value: "#000000" },
            ],
        },
    },
};

export default meta;

type Story = StoryObj<typeof OTourEncounter>;

export const Default: Story = {
    args: {
        navigation: {}, // Falls nötig, eine Navigation-Mock-Funktion einfügen
    },
};
