import React, {createContext, Dispatch, useContext, useReducer} from 'react';

export type Gender = "woman"|"man"

interface IUserData {
    wantsEmailUpdates: boolean
    email: string
    firstName: string
    birthDay: Date
    gender?: Gender
    genderDesire?: Gender
}

interface IUserAction {
    type: EACTION_USER;
    payload: string | Date | boolean;
}

export enum EACTION_USER {
    SET_EMAIL_UPDATES = 'SET_EMAIL_UPDATES',
    ADD_EMAIL = 'ADD_EMAIL',
    ADD_FIRSTNAME = 'ADD_FIRSTNAME',
    ADD_BIRTHDAY = 'ADD_BIRTHDAY',
    ADD_GENDER = 'ADD_GENDER',
    ADD_GENDER_DESIRE = 'ADD_GENDER_DESIRE',
}

interface IUserContextType {
    state: IUserData;
    dispatch: Dispatch<IUserAction>;
}

const initialState: IUserData = {
    wantsEmailUpdates: false,
    email: "",
    firstName: "",
    birthDay: new Date(),
    gender: undefined,
    genderDesire: undefined,
};

const userReducer = (state: IUserData, action: IUserAction): IUserData => {
    switch (action.type) {
        case EACTION_USER.SET_EMAIL_UPDATES:
            return {
                ...state,
                wantsEmailUpdates: action.payload as boolean,
            };
        case EACTION_USER.ADD_EMAIL:
            return {
                ...state,
                email: action.payload as string,
            };
        case EACTION_USER.ADD_FIRSTNAME:
            return {
                ...state,
                firstName: action.payload as string,
            };
        case EACTION_USER.ADD_BIRTHDAY:
            return {
                ...state,
                birthDay: action.payload as Date,
            };
        case EACTION_USER.ADD_GENDER:
            return {
                ...state,
                gender: action.payload as Gender,
            };
        case EACTION_USER.ADD_GENDER_DESIRE:
            return {
                ...state,
                genderDesire: action.payload as Gender,
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