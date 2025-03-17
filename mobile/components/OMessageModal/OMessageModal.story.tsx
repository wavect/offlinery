import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button, View } from "react-native";
import OMessageModal, { IOMessageModalProps } from "./OMessageModal";

const meta: Meta<typeof OMessageModal> = {
    title: "Components/OMessageModal",
    component: OMessageModal,
    argTypes: {
        userId: {
            control: "text",
            description: "User ID for the message modal",
        },
        encounterId: {
            control: "text",
            description: "Encounter ID for the message modal",
        },
        visible: {
            control: "boolean",
            description: "Visibility of the message modal",
        },
        onClose: {
            action: "closed",
            description: "Function called when the modal is closed",
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

type Story = StoryObj<typeof OMessageModal>;

// Default Story
export const Default: Story = {
    args: {
        userId: "user123",
        encounterId: "encounter456",
        visible: false,
    },
    render: ({
        userId,
        encounterId,
        visible,
        onClose,
    }: IOMessageModalProps) => {
        const [modalVisible, setModalVisible] = useState(visible);

        const toggleModal = () => setModalVisible(!modalVisible);

        return (
            <View>
                <Button title="Open Message Modal" onPress={toggleModal} />
                <OMessageModal
                    userId={userId}
                    encounterId={encounterId}
                    visible={modalVisible}
                    onClose={onClose}
                    firstName={"Anna"}
                />
            </View>
        );
    },
};

// Story with message error
export const WithMessageError: Story = {
    args: {
        userId: "user123",
        encounterId: "encounter456",
        visible: false,
    },
    render: ({
        userId,
        encounterId,
        visible,
        onClose,
    }: IOMessageModalProps) => {
        const [modalVisible, setModalVisible] = useState(visible);

        const toggleModal = () => setModalVisible(!modalVisible);

        return (
            <View>
                <Button title="Open Message Modal" onPress={toggleModal} />
                <OMessageModal
                    userId={userId}
                    encounterId={encounterId}
                    visible={modalVisible}
                    onClose={onClose}
                    firstName={"Anna"}
                />
            </View>
        );
    },
};

// Story for showing modal
export const ShowModal: Story = {
    args: {
        userId: "user123",
        encounterId: "encounter456",
        visible: true,
    },
    render: ({
        userId,
        encounterId,
        visible,
        onClose,
    }: IOMessageModalProps) => {
        return (
            <OMessageModal
                userId={userId}
                encounterId={encounterId}
                visible={visible}
                onClose={onClose}
                firstName={"Anna"}
            />
        );
    },
};

// Story for the modal in dark mode
export const DarkMode: Story = {
    args: {
        userId: "user123",
        encounterId: "encounter456",
        visible: true,
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
    render: ({
        userId,
        encounterId,
        visible,
        onClose,
    }: IOMessageModalProps) => {
        return (
            <OMessageModal
                userId={userId}
                encounterId={encounterId}
                visible={visible}
                onClose={onClose}
                firstName={"Anna"}
            />
        );
    },
};
