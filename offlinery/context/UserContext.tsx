import React, {createContext, Dispatch, useContext, useReducer} from 'react';

const UserContext = createContext();

interface IUserData {
    email: string
}

interface IUserAction {
    type: EACTION_USER;
    payload: string;
}

export enum EACTION_USER {
    ADD_EMAIL= 'ADD_EMAIL',
}

interface IUserContextType {
    state: IUserData;
    dispatch: Dispatch<IUserAction>;
}

const initialState: IUserData = {
    email: "",
};

const userReducer = (state: IUserData, action: IUserAction) => {
    switch (action.type) {
        case EACTION_USER.ADD_EMAIL:
            return {
                ...state,
                email: action.payload,
            };
        default:
            return state;
    }
};

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