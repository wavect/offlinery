import React, {createContext, Dispatch, useContext, useReducer} from 'react';
import * as ImagePicker from "expo-image-picker";

export type Gender = "woman"|"man"

export interface IUserData {
    wantsEmailUpdates: boolean
    email: string
    firstName: string
    birthDay: Date
    gender?: Gender
    genderDesire?: Gender
    images:  {
        [key in ImageIdx]?: ImagePicker.ImagePickerAsset;
    }
    isVerified: EVerificationStatus
}

export type ImageIdx = "0"|"1"|"2"|"3"|"4"|"5"
export interface IImageAction {
    imageIdx: ImageIdx
    image: ImagePicker.ImagePickerAsset
}

export interface IUserAction {
    type: EACTION_USER;
    payload: string | Date | boolean | IImageAction;
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
}

interface IUserContextType {
    state: IUserData;
    dispatch: Dispatch<IUserAction>;
}

export enum EVerificationStatus {
    VERIFIED = "verified",
    PENDING = "pending",
    /** @dev Not needed if not approaching right now (e.g. women) */
    NOT_NEEDED = "not_needed",
}

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
    isVerified: EVerificationStatus,
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
                isVerified: action.payload as EVerificationStatus,
            };
        default:
            return state;
    }
};

const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};