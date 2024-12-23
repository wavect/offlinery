import { storybookMockUserPublic } from "@/.storybook/state.mocks";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import OTeaserProfilePreview from "./OTeaserProfilePreview";

const meta: Meta<typeof OTeaserProfilePreview> = {
    title: "Components/OTeaserProfilePreview",
    component: OTeaserProfilePreview,
    argTypes: {
        prefixText: {
            control: "text",
            description: "Optional prefix text to display before the name",
        },
        showOpenProfileButton: {
            control: "boolean",
            description: "Whether to show the profile button",
        },
        navigation: {
            control: false,
            description: "Navigation prop (provided by navigation context)",
        },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 16, backgroundColor: "#fff" }}>
                <Story />
            </View>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OTeaserProfilePreview>;

const mockNavigation = {
    navigate: (route: string, params: any) => {
        console.log("Navigating to:", route, params);
    },
};

export const Default: Story = {
    args: {
        publicProfile: storybookMockUserPublic,
        showOpenProfileButton: true,
        navigation: mockNavigation,
    },
};

export const WithPrefixText: Story = {
    args: {
        ...Default.args,
        prefixText: "New match: ",
    },
};

export const WithSecondButton: Story = {
    args: {
        ...Default.args,
        secondButton: {
            onPress: () => console.log("Second button pressed"),
            text: "Message",
            disabled: false,
        },
    },
};

export const WithoutButtons: Story = {
    args: {
        ...Default.args,
        showOpenProfileButton: false,
    },
};

export const WithDisabledSecondButton: Story = {
    args: {
        ...Default.args,
        secondButton: {
            onPress: () => console.log("Second button pressed"),
            text: "Message",
            disabled: true,
            style: { opacity: 0.5 },
        },
    },
};
