import {
    BlacklistedRegionDTO,
    BlacklistedRegionDTOLocationTypeEnum,
    CreateUserDTO,
    UserApi,
    UserApproachChoiceEnum,
    UserControllerCreateUserRequest,
    UserDateModeEnum,
    UserGenderEnum,
    UserPreferredLanguageEnum,
    UserPublicDTO,
    UserVerificationStatusEnum,
} from "@/api/gen/src";
import { i18n } from "@/localization/translate.service";
import { getAge } from "@/utils/date.utils";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import React, { Dispatch, createContext, useContext, useReducer } from "react";
import { Platform } from "react-native";

export interface IUserData {
    /** @dev Backend assigned ID for registered users */
    id?: string;
    wantsEmailUpdates: boolean;
    email: string;
    firstName: string;
    clearPassword: string;
    birthDay: Date;
    gender?: UserGenderEnum;
    genderDesire?: UserGenderEnum;
    imageURIs: {
        [key in ImageIdx]?: ImagePicker.ImagePickerAsset | string;
    };
    verificationStatus: UserVerificationStatusEnum;
    approachChoice: UserApproachChoiceEnum;
    /** @dev Regions the user that wants to be approached marked as blacklisted */
    blacklistedRegions: MapRegion[];
    approachFromTime: Date;
    approachToTime: Date;
    bio: string;
    dateMode: UserDateModeEnum;
    /** @dev Set once logged in */
    jwtAccessToken?: string;
}

export const isAuthenticated = (state: IUserData) => {
    return !!state.jwtAccessToken;
};

export interface MapRegion {
    longitude: number;
    latitude: number;
    /**
     * The radius after the debounce.
     *
     * @remarks
     * Other than the `uiRadius`, this gets updated
     * after a certain debounce timer, so we do not
     * call the backend on every `UI`-update.
     */
    radius: number;
    /**
     * The radius displayed in the UI.
     *
     * @remarks
     * This is the radius displayed on the UI.
     * It gets updates as the user adjusts the radius.
     */
    uiRadius?: number;
}
export const mapRegionToBlacklistedRegionDTO = (
    region: MapRegion,
): BlacklistedRegionDTO => {
    return {
        radius: region.radius,
        location: {
            type: BlacklistedRegionDTOLocationTypeEnum.Point,
            coordinates: [
                region.longitude, // idx 0
                region.latitude, // idx 1
            ],
        },
    };
};

export type ImageIdx = "0" | "1" | "2" | "3" | "4" | "5";

export interface IImageAction {
    imageIdx: ImageIdx;
    image: ImagePicker.ImagePickerAsset;
}

export interface IUserAction {
    type: EACTION_USER;
    payload:
        | string
        | Date
        | boolean
        | IImageAction
        | UserApproachChoiceEnum
        | UserVerificationStatusEnum
        | MapRegion[]
        | UserDateModeEnum
        | Partial<IUserData>
        | number;
}

export enum EACTION_USER {
    SET_ID = "SET_ID",
    UPDATE_MULTIPLE = "UPDATE_MULTIPLE",
    SET_EMAIL_UPDATES = "SET_EMAIL_UPDATES",
    SET_EMAIL = "SET_EMAIL",
    SET_FIRSTNAME = "SET_FIRSTNAME",
    SET_CLEAR_PASSWORD = "SET_CLEAR_PASSWORD",
    SET_BIRTHDAY = "SET_BIRTHDAY",
    SET_GENDER = "SET_GENDER",
    SET_GENDER_DESIRE = "SET_GENDER_DESIRE",
    SET_IMAGE = "SET_IMAGE",
    SET_VERIFICATION_STATUS = "SET_VERIFICATION_STATUS",
    SET_APPROACH_CHOICE = "SET_APPROACH_CHOICE",
    SET_BLACKLISTED_REGIONS = "SET_BLACKLISTED_REGIONS",
    SET_APPROACH_FROM_TIME = "SET_APPROACH_FROM_TIME",
    SET_APPROACH_TO_TIME = "SET_APPROACH_TO_TIME",
    SET_BIO = "SET_BIO",
    SET_DATE_MODE = "SET_DATE_MODE",
    SET_JWT_ACCESS_TOKEN = "SET_JWT_ACCESS_TOKEN",
}

interface IUserContextType {
    state: IUserData;
    dispatch: Dispatch<IUserAction>;
}

export const DEFAULT_FROM_TIME = new Date();
DEFAULT_FROM_TIME.setHours(9, 0, 0, 0);
export const DEFAULT_TO_TIME = new Date();
DEFAULT_TO_TIME.setHours(19, 0, 0, 0);

const initialState: IUserData = {
    id: undefined,
    wantsEmailUpdates: false,
    email: "",
    firstName: "",
    clearPassword: "",
    birthDay: new Date(2000, 1, 1),
    gender: undefined,
    genderDesire: undefined,
    imageURIs: {
        "0": undefined,
        "1": undefined,
        "2": undefined,
        "3": undefined,
        "4": undefined,
        "5": undefined,
    },
    verificationStatus: UserVerificationStatusEnum.not_needed,
    approachChoice: UserApproachChoiceEnum.both,
    blacklistedRegions: [],
    approachFromTime: DEFAULT_FROM_TIME,
    approachToTime: DEFAULT_TO_TIME,
    bio: "No pick-up lines please. Just be chill.",
    dateMode: UserDateModeEnum.ghost,
    jwtAccessToken: undefined,
};

export const getSavedImageURIs = (state: IUserData): string[] => {
    const imgs: string[] = [];
    for (const img of Object.values(state.imageURIs)) {
        // return first image as people can upload image into any slot without filling out all of them as of now
        if (img) {
            isImagePicker(img) ? imgs.push(img.uri) : imgs.push(img);
        }
    }
    return imgs;
};

export const getPublicProfileFromUserData = (
    state: IUserData,
): UserPublicDTO => {
    return {
        id: state.id!,
        firstName: state.firstName,
        bio: state.bio,
        age: getAge(state.birthDay),
        imageURIs: getSavedImageURIs(state),
    };
};

const userReducer = (state: IUserData, action: IUserAction): IUserData => {
    switch (action.type) {
        case EACTION_USER.UPDATE_MULTIPLE:
            return { ...state, ...(action.payload as Partial<IUserData>) };
        case EACTION_USER.SET_ID:
            return {
                ...state,
                id: action.payload as string,
            };
        case EACTION_USER.SET_JWT_ACCESS_TOKEN:
            return {
                ...state,
                jwtAccessToken: action.payload as string,
            };
        case EACTION_USER.SET_EMAIL_UPDATES:
            return {
                ...state,
                wantsEmailUpdates: action.payload as boolean,
            };
        case EACTION_USER.SET_EMAIL:
            return {
                ...state,
                email: action.payload as string,
            };
        case EACTION_USER.SET_FIRSTNAME:
            return {
                ...state,
                firstName: action.payload as string,
            };
        case EACTION_USER.SET_CLEAR_PASSWORD:
            return {
                ...state,
                clearPassword: action.payload as string,
            };
        case EACTION_USER.SET_BIRTHDAY:
            return {
                ...state,
                birthDay: action.payload as Date,
            };
        case EACTION_USER.SET_GENDER:
            return {
                ...state,
                gender: action.payload as UserGenderEnum,
            };
        case EACTION_USER.SET_GENDER_DESIRE:
            return {
                ...state,
                genderDesire: action.payload as UserGenderEnum,
            };
        case EACTION_USER.SET_IMAGE:
            const { imageIdx, image } = action.payload as IImageAction;
            return {
                ...state,
                imageURIs: { ...state.imageURIs, [imageIdx]: image },
            };
        case EACTION_USER.SET_VERIFICATION_STATUS:
            return {
                ...state,
                verificationStatus:
                    action.payload as UserVerificationStatusEnum,
            };
        case EACTION_USER.SET_APPROACH_CHOICE:
            return {
                ...state,
                approachChoice: action.payload as UserApproachChoiceEnum,
            };
        case EACTION_USER.SET_BLACKLISTED_REGIONS:
            return {
                ...state,
                blacklistedRegions: action.payload as MapRegion[],
            };
        case EACTION_USER.SET_APPROACH_FROM_TIME:
            return {
                ...state,
                approachFromTime: action.payload as Date,
            };
        case EACTION_USER.SET_APPROACH_TO_TIME:
            return {
                ...state,
                approachToTime: action.payload as Date,
            };
        case EACTION_USER.SET_BIO:
            return {
                ...state,
                bio: action.payload as string,
            };
        case EACTION_USER.SET_DATE_MODE:
            return {
                ...state,
                dateMode: action.payload as UserDateModeEnum,
            };
        default:
            return state;
    }
};

const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = (): IUserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};

export const registerUser = async (
    state: IUserData,
    dispatch: React.Dispatch<IUserAction>,
    onSuccess: () => void,
    onError: (err: any) => void,
) => {
    const api = new UserApi();

    // Prepare the user data
    const userData: CreateUserDTO = {
        firstName: state.firstName,
        clearPassword: state.clearPassword,
        email: state.email,
        wantsEmailUpdates: state.wantsEmailUpdates,
        birthDay: state.birthDay,
        gender: state.gender!,
        genderDesire: state.genderDesire!,
        verificationStatus: state.verificationStatus,
        approachChoice: state.approachChoice,
        blacklistedRegions: state.blacklistedRegions.map((r) =>
            mapRegionToBlacklistedRegionDTO(r),
        ),
        approachFromTime: state.approachFromTime,
        approachToTime: state.approachToTime,
        bio: state.bio,
        dateMode: state.dateMode,
        preferredLanguage:
            (i18n.locale as UserPreferredLanguageEnum) ??
            UserPreferredLanguageEnum.en,
    };

    const requestParameters: UserControllerCreateUserRequest = {
        user: userData,
        images: getUserImagesForUpload(state),
    };

    try {
        const user = await api.userControllerCreateUser(requestParameters);
        console.log("User created successfully:", user);

        // Update the user state with the returned ID
        if (user.id) {
            dispatch({ type: EACTION_USER.SET_ID, payload: user.id });
        }

        // Navigate to the next screen or update the UI as needed
        onSuccess();
    } catch (error: any) {
        console.error("Error creating user:", error, JSON.stringify(error));
        onError(error);
        // Handle the error (e.g., show an error message to the user)
    }
};

export const getUserImagesForUpload = (
    state: IUserData,
): ImagePickerAsset[] => {
    return Object.values(state.imageURIs)
        .filter(isImagePicker)
        .map((image) => ({
            ...image,
            uri:
                Platform.OS === "ios"
                    ? image.uri.replace("file://", "")
                    : image.uri,
        }));
};

export const isImagePicker = (
    image: ImagePickerAsset | string | undefined,
): image is ImagePickerAsset => {
    return (
        image !== undefined &&
        typeof image === "object" &&
        image !== null &&
        "uri" in image
    );
};
