import { EncounterStatusEnum, UserPublicDTO } from "@/api/gen/src";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import React, { createContext, Dispatch, useContext, useReducer } from "react";

export interface IEncounters {
    encounters: IEncounterProfile[];
}

export enum EACTION_ENCOUNTERS {
    SET_ENCOUNTERS = "SET_ENCOUNTERS",
    SET_REPORTED = "SET_REPORTED",
    SET_DATE_STATUS = "SET_DATE_STATUS",
    SET_NEARBY_RIGHT_NOW = "SET_NEARBY_RIGHT_NOW",
}

interface IEncountersContextType {
    state: IEncounters;
    dispatch: Dispatch<IEncountersAction>;
}

interface IRelationshipUpdatePayload {
    encounterId: string;
    value: boolean | EncounterStatusEnum;
}

export interface IEncountersAction {
    type: EACTION_ENCOUNTERS;
    payload: IEncounterProfile[] | IRelationshipUpdatePayload;
}

const initialState: IEncounters = {
    encounters: [],
};

export const getPublicProfileFromEncounter = (
    state: IEncounterProfile,
): Omit<UserPublicDTO, "id"> => {
    return {
        firstName: state.firstName,
        bio: state.bio,
        age: state.age,
        imageURIs: state.imageURIs,
    };
};

const userReducer = (
    state: IEncounters,
    action: IEncountersAction,
): IEncounters => {
    switch (action.type) {
        case EACTION_ENCOUNTERS.SET_ENCOUNTERS:
            return {
                ...state,
                encounters: action.payload as IEncounterProfile[],
            };
        case EACTION_ENCOUNTERS.SET_REPORTED:
            const reportedUpdate = action.payload as IRelationshipUpdatePayload;
            return {
                ...state,
                encounters: state.encounters.map(
                    (encounter): IEncounterProfile =>
                        encounter.encounterId === reportedUpdate.encounterId
                            ? ({
                                  ...encounter,
                                  personalRelationship: {
                                      ...encounter.personalRelationship,
                                      reported: reportedUpdate.value as boolean,
                                  },
                              } as IEncounterProfile)
                            : encounter,
                ),
            };
        case EACTION_ENCOUNTERS.SET_DATE_STATUS:
            const dateStatusUpdate =
                action.payload as IRelationshipUpdatePayload;
            return {
                ...state,
                encounters: state.encounters.map(
                    (encounter): IEncounterProfile =>
                        encounter.encounterId === dateStatusUpdate.encounterId
                            ? ({
                                  ...encounter,
                                  personalRelationship: {
                                      ...encounter.personalRelationship,
                                      status: dateStatusUpdate.value as EncounterStatusEnum,
                                  },
                              } as IEncounterProfile)
                            : encounter,
                ),
            };
        case EACTION_ENCOUNTERS.SET_NEARBY_RIGHT_NOW:
            const isNearbyRightNowUpdate =
                action.payload as IRelationshipUpdatePayload;
            return {
                ...state,
                encounters: state.encounters.map(
                    (encounter): IEncounterProfile =>
                        encounter.encounterId === dateStatusUpdate.encounterId
                            ? ({
                                  ...encounter,
                                  personalRelationship: {
                                      ...encounter.personalRelationship,
                                      isNearbyRightNow:
                                          isNearbyRightNowUpdate.value as boolean,
                                  },
                              } as IEncounterProfile)
                            : encounter,
                ),
            };
        default:
            return state;
    }
};

const EncountersContext = createContext<IEncountersContextType | undefined>(
    undefined,
);

export const EncountersProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return (
        <EncountersContext.Provider value={{ state, dispatch }}>
            {children}
        </EncountersContext.Provider>
    );
};

export const useEncountersContext = (): IEncountersContextType => {
    const context = useContext(EncountersContext);
    if (context === undefined) {
        throw new Error(
            "useEncountersContext must be used within a EncountersProviders",
        );
    }
    return context;
};
