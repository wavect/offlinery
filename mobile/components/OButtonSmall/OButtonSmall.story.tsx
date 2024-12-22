import { Meta, StoryObj } from "@storybook/react";
import { IOButtonSmallVariant, OButtonSmall } from "./OButtonSmall";

const meta: Meta<typeof OButtonSmall> = {
    title: "Components/OButtonSmall",
    component: OButtonSmall,
    argTypes: {
        label: {
            control: "text",
            description: "Button label text",
        },
        variant: {
            control: "select",
            options: Object.values(IOButtonSmallVariant),
            description: "Button variant style",
        },
        isDisabled: {
            control: "boolean",
            description: "Disabled state of the button",
        },
        numberOfLines: {
            control: "number",
            description: "Number of lines for label text",
        },
        adjustsFontSizeToFit: {
            control: "boolean",
            description: "Whether text should adjust size to fit",
        },
        onPress: {
            action: "pressed",
            description: "Function called when button is pressed",
        },
    },
    args: {
        label: "Button",
        isDisabled: false,
        variant: IOButtonSmallVariant.Black,
        numberOfLines: 1,
        adjustsFontSizeToFit: false,
    },
};

export default meta;

type Story = StoryObj<typeof OButtonSmall>;

export const Default: Story = {
    args: {
        label: "Click Me",
    },
};

export const Primary: Story = {
    args: {
        label: "Primary Button",
        variant: IOButtonSmallVariant.Primary,
    },
};

export const Danger: Story = {
    args: {
        label: "Danger Button",
        variant: IOButtonSmallVariant.Danger,
    },
};

export const Disabled: Story = {
    args: {
        label: "Disabled Button",
        isDisabled: true,
    },
};

export const MultilineText: Story = {
    args: {
        label: "This is a button\nwith multiple lines",
        numberOfLines: 2,
    },
};

export const LoadingState: Story = {
    args: {
        label: "Loading Button",
        onPress: async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
        },
    },
};
