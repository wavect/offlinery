import { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
    stories: ["../components/**/*.story.?(ts|tsx|js|jsx)"],
    addons: [
        "@storybook/addon-ondevice-controls",
        "@storybook/addon-ondevice-actions",
    ],
};

export default main;
