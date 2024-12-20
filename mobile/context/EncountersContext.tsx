import { UserPublicDTO } from "@/api/gen/src";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import React, { Dispatch, createContext, useContext, useReducer } from "react";

export interface IEncounters {
    encounters: IEncounterProfile[];
}

/** @dev Partial Encounter BUT encounterID is mandatory since the update logic needs it as we are saving an array */
export type PartialEncounterProfile = {
    encounterId: string;
} & Partial<Omit<IEncounterProfile, "encounterId">>;

export enum EACTION_ENCOUNTERS {
    UPDATE_MULTIPLE = "UPDATE_MULTIPLE",
    PUSH_MULTIPLE = "PUSH_MULTIPLE",
}

interface IEncountersContextType {
    state: IEncounters;
    dispatch: Dispatch<IEncountersAction>;
}

export interface IEncountersAction {
    type: EACTION_ENCOUNTERS;
    payload: PartialEncounterProfile[];
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
        intentions: state.intentions,
    };
};

const userReducer = (
    state: IEncounters,
    action: IEncountersAction,
): IEncounters => {
    switch (action.type) {
        case EACTION_ENCOUNTERS.PUSH_MULTIPLE:
            const fetchedEncounters = action.payload as IEncounterProfile[];
            /** @DEV TODO */
            // saveEncountersLocally(fetchedEncounters);
            return {
                ...state,
                encounters: fetchedEncounters,
            };

        case EACTION_ENCOUNTERS.UPDATE_MULTIPLE:
            const payload: PartialEncounterProfile[] =
                action.payload satisfies PartialEncounterProfile[];

            const currentEncounters = state.encounters;

            // Update existing encounters and collect new ones
            const updatedEncounters: IEncounterProfile[] =
                currentEncounters.map((encounter) => {
                    const partialEncounter = payload.find(
                        (e) => e.encounterId === encounter.encounterId,
                    );
                    return partialEncounter
                        ? { ...encounter, ...partialEncounter }
                        : encounter;
                });

            // Find new encounters that don't exist in the current state
            const newEncounters = payload.filter(
                (payloadEncounter) =>
                    !currentEncounters.some(
                        (stateEncounter) =>
                            stateEncounter.encounterId ===
                            payloadEncounter.encounterId,
                    ),
            ) as IEncounterProfile[]; // NOTE: Just assuming that we fully define new encounters correctly, might need to be reevaluated!

            // Combine updated and new encounters
            const allEncounters: IEncounterProfile[] = [
                ...updatedEncounters,
                ...newEncounters,
            ];
            /** @DEV TODO */
            // saveEncountersLocally(fetchedEncounters);

            return {
                ...state,
                encounters: allEncounters,
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
