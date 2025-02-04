import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OAppIntroductionSliderContent } from "./OAppIntroductionSliderContent";

const meta: Meta<typeof OAppIntroductionSliderContent> = {
    title: "Components/OAppIntroductionSliderContent",
    component: OAppIntroductionSliderContent,
    argTypes: {
        img: {
            control: "object",
            description: "Bild für den Slider",
        },
        title: {
            control: "text",
            description: "Titel des Slides",
        },
        description: {
            control: "text",
            description: "Beschreibungstext des Slides",
        },
        conclusion: {
            control: "text",
            description: "Fazit oder abschließender Text des Slides",
        },
        lastPageAction: {
            action: "lastPageAction",
            description: "Aktion beim letzten Slide",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
                <Story />
            </View>
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

type Story = StoryObj<typeof OAppIntroductionSliderContent>;

export const Default: Story = {
    args: {
        img: require("@/assets/example-image.png"), // Stelle sicher, dass das Bild existiert
        title: "Willkommen bei unserer App",
        description: "Erlebe eine völlig neue Art der Vernetzung.",
        conclusion: "Lass uns loslegen!",
    },
};

export const LastPageWithAction: Story = {
    args: {
        img: require("@/assets/example-image.png"),
        title: "Fast geschafft!",
        description: "Bereit für den nächsten Schritt?",
        conclusion: "Tippe auf 'Weiter', um zu starten!",
        lastPageAction: () => console.log("Letzter Slide gedrückt!"),
    },
};
