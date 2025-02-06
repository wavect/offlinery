import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button, View } from "react-native";
import { OModal } from "./OModal"; // Stelle sicher, dass der Pfad zur OModal-Komponente korrekt ist

// Meta-Konfiguration für OModal-Komponente
const meta: Meta<typeof OModal> = {
    title: "Components/OModal",
    component: OModal,
    argTypes: {
        showModal: {
            control: "boolean",
            description: "Visibility of the modal",
        },
        text: {
            control: "text",
            description: "Text displayed inside the modal",
        },
        setShowModal: {
            action: "setShowModal",
            description: "Function to set the modal visibility",
        },
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    alignItems: "center",
                    width: "100%",
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

type Story = StoryObj<typeof OModal>;

// Default Story
export const Default: Story = {
    args: {
        showModal: false,
        text: "This is a modal",
    },
    render: (args) => {
        const [showModal, setShowModal] = useState(args.showModal);

        return (
            <View style={{ flex: 1 }}>
                <Button title="Open Modal" onPress={() => setShowModal(true)} />
                <OModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    text={args.text}
                />
            </View>
        );
    },
};

// Story with Custom Text
export const WithCustomText: Story = {
    args: {
        showModal: false,
        text: "This is a custom message in the modal.",
    },
    render: (args) => {
        const [showModal, setShowModal] = useState(args.showModal);

        return (
            <View style={{ flex: 1 }}>
                <Button title="Open Modal" onPress={() => setShowModal(true)} />
                <OModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    text={args.text}
                />
            </View>
        );
    },
};

// Story with Modal initially visible
export const ModalVisible: Story = {
    args: {
        showModal: true,
        text: "The modal is visible by default.",
    },
    render: (args) => {
        const [showModal, setShowModal] = useState(args.showModal);

        return (
            <View style={{ flex: 1 }}>
                <OModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    text={args.text}
                />
            </View>
        );
    },
};
