import { Color } from "@/GlobalStyles";
import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { OFloatingActionButton } from "./OFloatingActionButton";

const meta: Meta<typeof OFloatingActionButton> = {
    title: "Components/OFloatingActionButton",
    component: OFloatingActionButton,
    argTypes: {
        icon: {
            control: "text",
            description: "Name of the Material Icon to display",
        },
        action: {
            action: "clicked",
            description: "Function triggered when the button is pressed",
        },
        color: {
            control: "color",
            description: "Background color of the button",
        },
        size: {
            control: {
                type: "select",
                options: ["md", "xs"],
            },
            description: "Size of the button",
        },
        position: {
            control: {
                type: "select",
                options: [
                    "bottomRight",
                    "bottomLeft",
                    "topRight",
                    "topLeft",
                    "right",
                ],
            },
            description: "Position of the button on the screen",
        },
    },
};

export default meta;

type Story = StoryObj<typeof OFloatingActionButton>;

export const Default: Story = {
    args: {
        icon: "add",
        action: action("Floating button clicked"),
        color: Color.primary,
        size: "md",
        position: "bottomRight",
    },
};

export const SmallButton: Story = {
    args: {
        ...Default.args,
        size: "xs",
    },
};

export const CustomPosition: Story = {
    args: {
        ...Default.args,
        position: "topLeft",
    },
};

export const CustomColor: Story = {
    args: {
        ...Default.args,
        color: "#FF5733",
    },
};
