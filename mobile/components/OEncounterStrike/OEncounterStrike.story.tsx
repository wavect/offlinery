import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { OEncounterStrike } from "./OEncounterStrike";

const meta: Meta<typeof OEncounterStrike> = {
    title: "Components/OEncounterStrike",
    component: OEncounterStrike,
    argTypes: {
        streakCounter: {
            control: { type: "number", min: 1, max: 10, step: 1 },
            description: "Number of flame elements to display",
        },
        isNearbyRightNow: {
            control: "boolean",
            description: "Controls the opacity of the flames",
        },
    },
    args: {
        streakCounter: 3,
        isNearbyRightNow: true,
    },
    decorators: [
        (Story) => (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1a1a1a",
                    padding: 20,
                }}
            >
                <Story />
            </View>
        ),
    ],
    parameters: {
        notes: `
      # Animated Flame Component
      
      A customizable animated flame component that displays multiple animated flames in a row.
      
      ## Usage
      
      \`\`\`tsx
      <OEncounterStrike 
        streakCounter={3} 
        isNearbyRightNow={true} 
      />
      \`\`\`
      
      ## Features
      - Multiple simultaneous animations (scale, opacity, position)
      - Configurable number of flames
      - Dynamic opacity based on nearby status
      - Optimized with native driver
    `,
    },
};

export default meta;

type Story = StoryObj<typeof OEncounterStrike>;

export const Default: Story = {
    args: {
        streakCounter: 3,
        isNearbyRightNow: false,
    },
};

export const SingleFlame: Story = {
    args: {
        streakCounter: 1,
        isNearbyRightNow: true,
    },
};

export const NoStreakNearby: Story = {
    args: {
        isNearbyRightNow: true,
        streakCounter: undefined,
    },
};

export const NoStreakNotNearby: Story = {
    args: {
        isNearbyRightNow: false,
        streakCounter: undefined,
    },
};

export const ManyFlames: Story = {
    args: {
        streakCounter: 5,
        isNearbyRightNow: true,
    },
};

export const InactiveFlames: Story = {
    args: {
        streakCounter: 3,
        isNearbyRightNow: false,
    },
};

// Showcase different states in a grid
export const FlameShowcase: Story = {
    decorators: [
        (Story) => (
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 20,
                    backgroundColor: "#1a1a1a",
                    padding: 20,
                }}
            >
                <View>
                    <Story
                        args={{ streakCounter: 1, isNearbyRightNow: true }}
                    />
                </View>
                <View>
                    <Story
                        args={{ streakCounter: 2, isNearbyRightNow: true }}
                    />
                </View>
                <View>
                    <Story
                        args={{ streakCounter: 3, isNearbyRightNow: false }}
                    />
                </View>
                <View>
                    <Story
                        args={{ streakCounter: 4, isNearbyRightNow: true }}
                    />
                </View>
            </View>
        ),
    ],
};

// Interactive playground
export const Playground: Story = {
    parameters: {
        controls: {
            expanded: true,
        },
    },
};
