import { Meta, StoryObj } from "@storybook/react";
import { OAppIntroductionSliderContent } from "./OAppIntroductionSliderContent";

// 🔥 Bildimport mit require(), um Metro-Bundler-Fehler zu vermeiden
const appForAllImage = require("../../assets/introduction-slider/appForAll.png");

const meta: Meta<typeof OAppIntroductionSliderContent> = {
    title: "Components/OAppIntroductionSliderContent",
    component: OAppIntroductionSliderContent,
    argTypes: {
        title: { control: "text", description: "Der Titel des Slides." },
        description: {
            control: "text",
            description: "Die Beschreibung des Slides.",
        },
        conclusion: {
            control: "text",
            description: "Abschließender Text des Slides.",
        },
        lastPageAction: {
            action: "clicked",
            description: "Aktion, wenn auf den Button geklickt wird.",
        },
    },
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

type Story = StoryObj<typeof OAppIntroductionSliderContent>;

export const Default: Story = {
    args: {
        img: appForAllImage,
        title: "Willkommen bei unserer App!",
        description: "Erlebe die Zukunft der digitalen Vernetzung.",
        conclusion: "Lass uns gemeinsam starten!",
    },
};

export const LastPageWithAction: Story = {
    args: {
        img: appForAllImage,
        title: "Das ist die letzte Seite!",
        description: "Vielen Dank für deine Zeit.",
        conclusion: "Bereit für den nächsten Schritt?",
        lastPageAction: () => console.log("Letzte Seite Aktion ausgeführt!"),
    },
};
