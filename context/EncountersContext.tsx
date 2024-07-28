import React, {createContext, Dispatch, useContext, useReducer} from 'react';
import {EDateStatus, IPublicProfile} from "../types/PublicProfile.types";

export interface IEncounters {
    encounters: IPublicProfile[]
}

export enum EACTION_ENCOUNTERS {
    SET_ENCOUNTERS = 'SET_ENCOUNTERS',
    SET_REPORTED = 'SET_REPORTED',
    SET_DATE_STATUS = 'SET_DATE_STATUS'
}

interface IEncountersContextType {
    state: IEncounters;
    dispatch: Dispatch<IEncountersAction>;
}

interface IRelationshipUpdatePayload {
    encounterId: string
    value: boolean | EDateStatus
}

export interface IEncountersAction {
    type: EACTION_ENCOUNTERS;
    payload: IPublicProfile[] | IRelationshipUpdatePayload;
}

const initialState: IEncounters = {
    // TODO: Remove default state and load from server based on user!
    encounters: [{
        encounterId: '1',
        firstName: 'Kevin',
        age: '27',
        rating: 4,
        mainImageURI: 'https://wavect.io/img/team/kevin.webp',
        personalRelationship: {
            lastTimePassedBy: '4 days ago',
            lastLocationPassedBy: 'Altstadt Innsbruck',
            status: EDateStatus.NOT_MET,
            reported: false,
        }
    },
        {
            encounterId: '2',
            firstName: 'Kev',
            age: '28',
            rating: 3.4,
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                lastTimePassedBy: '3 hours ago',
                lastLocationPassedBy: 'Marien-Theresien-Straße 1',
                status: EDateStatus.MET_NOT_INTERESTED,
                reported: true,
            }
        },
        {
            encounterId: '3',
            firstName: 'Kev',
            age: '28',
            rating: 3.4,
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                lastTimePassedBy: '1 week ago',
                lastLocationPassedBy: 'Cafe Katzung',
                status: EDateStatus.MET_NOT_INTERESTED,
                reported: false,
            }
        },
    ],
};

const userReducer = (state: IEncounters, action: IEncountersAction): IEncounters => {
    switch (action.type) {
        case EACTION_ENCOUNTERS.SET_ENCOUNTERS:
            return {
                ...state,
                encounters: action.payload as IPublicProfile[],
            };
        case EACTION_ENCOUNTERS.SET_REPORTED:
            const reportedUpdate = action.payload as IRelationshipUpdatePayload
            return {
                ...state,
                encounters: state.encounters.map(encounter =>
                    encounter.encounterId === reportedUpdate.encounterId
                        ? {
                            ...encounter,
                            personalRelationship: {
                                ...encounter.personalRelationship,
                                reported: reportedUpdate.value,
                            }
                        }
                        : encounter
                )
            }
        case EACTION_ENCOUNTERS.SET_DATE_STATUS:
            const dateStatusUpdate = action.payload as IRelationshipUpdatePayload
            return {
                ...state,
                encounters: state.encounters.map(encounter =>
                    encounter.encounterId === dateStatusUpdate.encounterId
                        ? {
                            ...encounter,
                            personalRelationship: {
                                ...encounter.personalRelationship,
                                status: dateStatusUpdate.value,
                            }
                        }
                        : encounter
                )
            }
        default:
            return state;
    }
};

const EncountersContext = createContext<IEncountersContextType | undefined>(undefined);

export const EncountersProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return (
        <EncountersContext.Provider value={{state, dispatch}}>
            {children}
        </EncountersContext.Provider>
    );
};

export const useEncountersContext = (): IEncountersContextType => {
    const context = useContext(EncountersContext);
    if (context === undefined) {
        throw new Error('useEncountersContext must be used within a EncountersProviders');
    }
    return context;
};