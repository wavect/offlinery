import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text } from "react-native";
import { OPageContainer } from "./OPageContainer";

const meta: Meta<typeof OPageContainer> = {
    title: "Components/OPageContainer",
    component: OPageContainer,
    argTypes: {
        title: {
            control: "text",
            description: "The main title for the page",
        },
        subtitle: {
            control: "text",
            description: "The subtitle for the page",
        },
        children: {
            control: "text",
            description: "Content inside the page",
        },
        bottomContainerChildren: {
            control: "text",
            description: "Content for the bottom container",
        },
        fullpageIcon: {
            control: "select",
            options: ["home", "settings", "search", "info", "help"],
            description: "Icon to display on the page (full-screen)",
        },
        doNotUseScrollView: {
            control: "boolean",
            description:
                "Whether to disable the ScrollView (use View instead).",
        },
        refreshFunc: {
            action: "refreshed",
            description: "Callback function triggered when refreshing",
        },
    },
    decorators: [
        (Story) => (
            <div style={{ padding: "20px" }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OPageContainer>;

export const Default: Story = {
    args: {
        title: "Page Title",
        subtitle: "This is a subtitle for the page.",
        children: <Text>Page content goes here.</Text>,
        bottomContainerChildren: <Text>Bottom content here.</Text>,
    },
};

export const FullPageIcon: Story = {
    args: {
        title: "Page with Full Icon",
        subtitle: "This page includes a full-page icon.",
        fullpageIcon: "home",
        children: <Text>Content with a background icon.</Text>,
    },
};

export const ScrollablePage: Story = {
    args: {
        title: "Scrollable Page",
        subtitle: "This page has a scrollable content area.",
        doNotUseScrollView: false,
        children: (
            <Text>
                Here is some long content that you can scroll through. It is a
                test for demonstrating the scroll functionality. More content
                will be added here to make it long enough to scroll.
            </Text>
        ),
    },
};

export const NoScrollPage: Story = {
    args: {
        title: "Non-Scrollable Page",
        subtitle: "This page has no scrolling.",
        doNotUseScrollView: true,
        children: <Text>This page does not scroll.</Text>,
    },
};

export const RefreshablePage: Story = {
    args: {
        title: "Refreshable Page",
        subtitle: "Pull to refresh this page.",
        refreshFunc: async () => {
            console.log("Page refreshed!");
        },
        children: <Text>Pull down to refresh the page content.</Text>,
    },
};
