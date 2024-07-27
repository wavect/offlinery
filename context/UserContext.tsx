import React, {createContext, Dispatch, useContext, useReducer} from 'react';
import * as ImagePicker from "expo-image-picker";
import {LatLng} from "react-native-maps";

export type Gender = "woman" | "man"

export interface IUserData {
    wantsEmailUpdates: boolean
    email: string
    firstName: string
    birthDay: Date
    gender?: Gender
    genderDesire?: Gender
    images: {
        [key in ImageIdx]?: ImagePicker.ImagePickerAsset;
    }
    verificationStatus: EVerificationStatus
    approachChoice: EApproachChoice
    street: string
    postalCode: string
    country: string
    /** @dev Regions the user that wants to be approached marked as blacklisted */
    blacklistedRegions: MapRegion[]
    approachFromTime: Date
    approachToTime: Date
}

export interface MapRegion {
    center: LatLng;
    radius: number;
}

export type ImageIdx = "0" | "1" | "2" | "3" | "4" | "5"

export interface IImageAction {
    imageIdx: ImageIdx
    image: ImagePicker.ImagePickerAsset
}

export interface IUserAction {
    type: EACTION_USER;
    payload: string | Date | boolean | IImageAction | EApproachChoice | EVerificationStatus | MapRegion[];
}

export enum EACTION_USER {
    SET_EMAIL_UPDATES = 'SET_EMAIL_UPDATES',
    SET_EMAIL = 'SET_EMAIL',
    SET_FIRSTNAME = 'SET_FIRSTNAME',
    SET_BIRTHDAY = 'SET_BIRTHDAY',
    SET_GENDER = 'SET_GENDER',
    SET_GENDER_DESIRE = 'SET_GENDER_DESIRE',
    SET_IMAGE = 'SET_IMAGE',
    SET_VERIFICATION_STATUS = 'SET_VERIFICATION_STATUS',
    SET_APPROACH_CHOICE = 'SET_APPROACH_CHOICE',
    SET_STREET = 'SET_STREET',
    SET_POSTAL_CODE = 'SET_POSTAL_CODE',
    SET_COUNTRY = 'SET_COUNTRY',
    SET_BLACKLISTED_REGIONS = 'SET_BLACKLISTED_REGIONS',
    SET_APPROACH_FROM_TIME = 'SET_APPROACH_FROM_TIME',
    SET_APPROACH_TO_TIME = 'SET_APPROACH_TO_TIME',
}

interface IUserContextType {
    state: IUserData;
    dispatch: Dispatch<IUserAction>;
}

export enum EApproachChoice {
    APPROACH = "approach",
    BE_APPROACHED = "be_approached",
    BOTH = "both"
}

export enum EVerificationStatus {
    VERIFIED = "verified",
    PENDING = "pending",
    /** @dev Not needed if not approaching right now (e.g. women) */
    NOT_NEEDED = "not_needed",
}

export const DEFAULT_FROM_TIME = new Date()
DEFAULT_FROM_TIME.setHours(9, 0, 0, 0)
export const DEFAULT_TO_TIME = new Date()
DEFAULT_TO_TIME.setHours(19, 0, 0, 0)

const initialState: IUserData = {
    wantsEmailUpdates: false,
    email: "",
    firstName: "",
    birthDay: new Date(),
    gender: undefined,
    genderDesire: undefined,
    images: {
        "0": undefined,
        "1": undefined,
        "2": undefined,
        "3": undefined,
        "4": undefined,
        "5": undefined,
    },
    verificationStatus: EVerificationStatus.NOT_NEEDED,
    approachChoice: EApproachChoice.BOTH,
    street: "",
    postalCode: "",
    country: "",
    blacklistedRegions: [],
    approachFromTime: DEFAULT_FROM_TIME,
    approachToTime: DEFAULT_TO_TIME,
};

const userReducer = (state: IUserData, action: IUserAction): IUserData => {
    switch (action.type) {
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
        case EACTION_USER.SET_BIRTHDAY:
            return {
                ...state,
                birthDay: action.payload as Date,
            };
        case EACTION_USER.SET_GENDER:
            return {
                ...state,
                gender: action.payload as Gender,
            };
        case EACTION_USER.SET_GENDER_DESIRE:
            return {
                ...state,
                genderDesire: action.payload as Gender,
            };
        case EACTION_USER.SET_IMAGE:
            const {imageIdx, image} = action.payload as IImageAction
            return {
                ...state,
                images: {...state.images, [imageIdx]: image},
            };
        case EACTION_USER.SET_VERIFICATION_STATUS:
            return {
                ...state,
                verificationStatus: action.payload as EVerificationStatus,
            };
        case EACTION_USER.SET_APPROACH_CHOICE:
            return {
                ...state,
                approachChoice: action.payload as EApproachChoice,
            };
        case EACTION_USER.SET_STREET:
            return {
                ...state,
                street: action.payload as string,
            };
        case EACTION_USER.SET_POSTAL_CODE:
            return {
                ...state,
                postalCode: action.payload as string,
            };
        case EACTION_USER.SET_COUNTRY:
            return {
                ...state,
                country: action.payload as string,
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
        default:
            return state;
    }
};

const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return (
        <UserContext.Provider value={{state, dispatch}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = (): IUserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};