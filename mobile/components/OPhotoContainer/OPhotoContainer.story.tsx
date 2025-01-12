import { PhotoContainer } from "@/components/OPhotoContainer/OPhotoContainer";
import { IUserAction, IUserData } from "@/context/UserContext";
import { Meta, StoryObj } from "@storybook/react";
import * as ImagePicker from "expo-image-picker";
import { PermissionStatus } from "expo-image-picker";
import React from "react";
import { View } from "react-native";

// Mock initial state matching the actual structure
const mockState: IUserData = {
    wantsEmailUpdates: false,
    email: "",
    firstName: "",
    clearPassword: "",
    birthDay: new Date(2000, 1, 1),
    imageURIs: {
        "0": undefined,
        "1": undefined,
        "2": undefined,
        "3": undefined,
        "4": undefined,
        "5": undefined,
    },
    verificationStatus: "pending",
    approachChoice: "both",
    blacklistedRegions: [],
    approachFromTime: new Date(),
    approachToTime: new Date(),
    bio: "",
    dateMode: "ghost",
    markedForDeletion: false,
};

// Mock dispatch function
const mockDispatch: React.Dispatch<IUserAction> = (action) => {
    console.log("Dispatched action:", action);
};

// Mock media permission response
const mockMediaStatus: ImagePicker.MediaLibraryPermissionResponse = {
    status: PermissionStatus.GRANTED,
    granted: true,
    expires: "never",
    canAskAgain: true,
};

// Mock permission request function
const mockRequestMediaLibPermission = async () => mockMediaStatus;

const meta: Meta<typeof PhotoContainer> = {
    title: "Components/PhotoContainer",
    component: PhotoContainer,
    parameters: {
        notes: `
      PhotoContainer is used for managing user profile photos.
      - Supports image selection from media library
      - Handles image preview and removal
      - Integrates with the UserContext for state management
    `,
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 20, backgroundColor: "#f5f5f5" }}>
                <Story />
            </View>
        ),
    ],
    argTypes: {
        size: {
            control: { type: "number" },
            description: "Size of the photo container in pixels",
        },
        imageIdx: {
            control: { type: "select" },
            options: ["0", "1", "2", "3", "4", "5"],
            description: "Index of the image slot (0-5)",
        },
    },
};

export default meta;

type Story = StoryObj<typeof PhotoContainer>;

export const Empty: Story = {
    args: {
        imageIdx: "0",
        dispatch: mockDispatch,
        state: mockState,
        size: 200,
        mediaStatus: mockMediaStatus,
        requestMediaLibPermission: mockRequestMediaLibPermission,
    },
};

export const WithImage: Story = {
    args: {
        ...Empty.args,
        state: {
            ...mockState,
            imageURIs: {
                ...mockState.imageURIs,
                "0": {
                    uri: "https://placekitten.com/200/200",
                    fileName: "0",
                    width: 200,
                    height: 200,
                    type: "image",
                    fileSize: 1024,
                },
            },
        },
    },
};

export const MultipleImages: Story = {
    args: {
        ...Empty.args,
        imageIdx: "1",
        state: {
            ...mockState,
            imageURIs: {
                "0": {
                    uri: "https://placekitten.com/200/200",
                    fileName: "0",
                    width: 200,
                    height: 200,
                    type: "image",
                    fileSize: 1024,
                },
                "1": {
                    uri: "https://placekitten.com/201/201",
                    fileName: "1",
                    width: 201,
                    height: 201,
                    type: "image",
                    fileSize: 1024,
                },
            },
        },
    },
};

export const SmallSize: Story = {
    args: {
        ...Empty.args,
        size: 100,
    },
};

export const LargeSize: Story = {
    args: {
        ...Empty.args,
        size: 300,
    },
};

export const WithPermissionDenied: Story = {
    args: {
        ...Empty.args,
        mediaStatus: {
            ...mockMediaStatus,
            status: PermissionStatus.DENIED,
            granted: false,
        },
    },
};
