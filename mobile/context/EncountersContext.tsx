import React, {createContext, Dispatch, useContext, useReducer} from 'react';
import {EDateStatus, IEncounterProfile, IPublicProfile} from "../types/PublicProfile.types";
import {getAge} from "../utils/date.utils";
import {getFirstImage, IUserData} from "./UserContext";

export interface IEncounters {
    encounters: IEncounterProfile[]
}

export enum EACTION_ENCOUNTERS {
    SET_ENCOUNTERS = 'SET_ENCOUNTERS',
    SET_REPORTED = 'SET_REPORTED',
    SET_DATE_STATUS = 'SET_DATE_STATUS',
    SET_NEARBY_RIGHT_NOW = 'SET_NEARBY_RIGHT_NOW',
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
    payload: IEncounterProfile[] | IRelationshipUpdatePayload;
}

const initialState: IEncounters = {
    // TODO: Remove default state and load from server based on user!
    encounters: [{
        encounterId: '1',
        firstName: 'Kevin',
        age: '27',
        rating: 4,
        bio: 'Love going to the gym.',
        mainImageURI: 'https://wavect.io/img/team/kevin.webp',
        personalRelationship: {
            isNearbyRightNow: true,
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
            bio: 'Investing in crypto',
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                isNearbyRightNow: false,
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
            bio: 'Serial Entrepreneur. Need to know more?',
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                isNearbyRightNow: false,
                lastTimePassedBy: '1 week ago',
                lastLocationPassedBy: 'Cafe Katzung',
                status: EDateStatus.MET_NOT_INTERESTED,
                reported: false,
            }
        },
    ],
};

export const getPublicProfileFromEncounter = (state: IEncounterProfile): IPublicProfile => {
    return {
        firstName: state.firstName,
        bio: state.bio,
        age: state.age,
        mainImageURI: state.mainImageURI,
    }
}


const userReducer = (state: IEncounters, action: IEncountersAction): IEncounters => {
    switch (action.type) {
        case EACTION_ENCOUNTERS.SET_ENCOUNTERS:
            return {
                ...state,
                encounters: action.payload as IEncounterProfile[],
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
                                reported: reportedUpdate.value as boolean,
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
                                status: dateStatusUpdate.value as EDateStatus,
                            }
                        }
                        : encounter
                )
            }
        case EACTION_ENCOUNTERS.SET_NEARBY_RIGHT_NOW:
            const isNearbyRightNowUpdate = action.payload as IRelationshipUpdatePayload
            return {
                ...state,
                encounters: state.encounters.map(encounter =>
                    encounter.encounterId === dateStatusUpdate.encounterId
                        ? {
                            ...encounter,
                            personalRelationship: {
                                ...encounter.personalRelationship,
                                isNearbyRightNow: isNearbyRightNowUpdate.value as boolean,
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