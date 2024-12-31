import { EncounterPublicDTO, UserPublicDTO } from "@/api/gen/src";
import React, { Dispatch, createContext, useContext, useReducer } from "react";

export interface IEncounters {
    encounters: EncounterPublicDTO[];
    isWalkthroughRunning: boolean;
}

/** @dev Partial Encounter BUT id is mandatory since the update logic needs it as we are saving an array */
export type PartialEncounterProfile = {
    id: string;
} & Partial<EncounterPublicDTO>;

export enum EACTION_ENCOUNTERS {
    UPDATE_MULTIPLE = "UPDATE_MULTIPLE",
    PUSH_MULTIPLE = "PUSH_MULTIPLE",
    SET_IS_WALKTHROUGH_RUNNING = "SET_IS_WALKTHROUGH_RUNNING",
}

interface IEncountersContextType {
    state: IEncounters;
    dispatch: Dispatch<IEncountersAction>;
}

export interface IEncountersAction {
    type: EACTION_ENCOUNTERS;
    payload: PartialEncounterProfile[] | boolean;
}

const initialState: IEncounters = {
    encounters: [],
    isWalkthroughRunning: false,
};

export const getPublicProfileFromEncounter = (
    state: EncounterPublicDTO,
): Omit<UserPublicDTO, "id"> => {
    return {
        firstName: state.otherUser.firstName,
        bio: state.otherUser.bio,
        age: state.otherUser.age,
        imageURIs: state.otherUser.imageURIs,
        intentions: state.otherUser.intentions,
    };
};

const userReducer = (
    state: IEncounters,
    action: IEncountersAction,
): IEncounters => {
    switch (action.type) {
        case EACTION_ENCOUNTERS.SET_IS_WALKTHROUGH_RUNNING:
            return {
                ...state,
                isWalkthroughRunning: action.payload as boolean,
            };

        case EACTION_ENCOUNTERS.PUSH_MULTIPLE:
            const fetchedEncounters = action.payload as EncounterPublicDTO[];
            /** @DEV TODO */
            // saveEncountersLocally(fetchedEncounters);
            return {
                ...state,
                encounters: fetchedEncounters,
            };

        case EACTION_ENCOUNTERS.UPDATE_MULTIPLE:
            const payload: PartialEncounterProfile[] =
                action.payload as PartialEncounterProfile[];

            const currentEncounters = state.encounters;

            // Update existing encounters and collect new ones
            const updatedEncounters: EncounterPublicDTO[] =
                currentEncounters.map((encounter) => {
                    const partialEncounter = payload.find(
                        (e) => e.id === encounter.id,
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
                            stateEncounter.id === payloadEncounter.id,
                    ),
            ) as EncounterPublicDTO[]; // NOTE: Just assuming that we fully define new encounters correctly, might need to be reevaluated!

            // Combine updated and new encounters
            const allEncounters: EncounterPublicDTO[] = [
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

export const EncountersContext = createContext<
    IEncountersContextType | undefined
>(undefined);

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
