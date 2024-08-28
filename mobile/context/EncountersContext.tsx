import React, { createContext, Dispatch, useContext, useReducer } from "react";
import { EncounterStatusEnum, UserPublicDTO } from "../api/gen/src";
import { IEncounterProfile } from "../types/PublicProfile.types";

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
  // TODO: Remove default state and load from server based on user!
  encounters: [
    {
      encounterId: "1",
      firstName: "Kevin",
      age: "27",
      rating: 4,
      bio: "Love going to the gym.",
      imageURIs: [
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/103123/pexels-photo-103123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ],
      personalRelationship: {
        isNearbyRightNow: true,
        lastTimePassedBy: "4 days ago",
        lastLocationPassedBy: "Altstadt Innsbruck",
        status: EncounterStatusEnum.not_met,
        reported: false,
      },
    },
    {
      encounterId: "2",
      firstName: "Kev",
      age: "28",
      rating: 3.4,
      bio: "Investing in crypto",
      imageURIs: [
        "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ],
      personalRelationship: {
        isNearbyRightNow: false,
        lastTimePassedBy: "3 hours ago",
        lastLocationPassedBy: "Marien-Theresien-Straße 1",
        status: EncounterStatusEnum.met_not_interested,
        reported: true,
      },
    },
    {
      encounterId: "3",
      firstName: "Kev",
      age: "28",
      rating: 3.4,
      bio: "Serial Entrepreneur. Need to know more?",
      imageURIs: [
        "https://images.pexels.com/photos/670720/pexels-photo-670720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ],
      personalRelationship: {
        isNearbyRightNow: false,
        lastTimePassedBy: "1 week ago",
        lastLocationPassedBy: "Cafe Katzung",
        status: EncounterStatusEnum.met_not_interested,
        reported: false,
      },
    },
  ],
};

export const getPublicProfileFromEncounter = (
  state: IEncounterProfile,
): UserPublicDTO => {
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
        encounters: state.encounters.map((encounter) =>
          encounter.encounterId === reportedUpdate.encounterId
            ? {
                ...encounter,
                personalRelationship: {
                  ...encounter.personalRelationship,
                  reported: reportedUpdate.value as boolean,
                },
              }
            : encounter,
        ),
      };
    case EACTION_ENCOUNTERS.SET_DATE_STATUS:
      const dateStatusUpdate = action.payload as IRelationshipUpdatePayload;
      return {
        ...state,
        encounters: state.encounters.map((encounter) =>
          encounter.encounterId === dateStatusUpdate.encounterId
            ? {
                ...encounter,
                personalRelationship: {
                  ...encounter.personalRelationship,
                  status: dateStatusUpdate.value as EncounterStatusEnum,
                },
              }
            : encounter,
        ),
      };
    case EACTION_ENCOUNTERS.SET_NEARBY_RIGHT_NOW:
      const isNearbyRightNowUpdate =
        action.payload as IRelationshipUpdatePayload;
      return {
        ...state,
        encounters: state.encounters.map((encounter) =>
          encounter.encounterId === dateStatusUpdate.encounterId
            ? {
                ...encounter,
                personalRelationship: {
                  ...encounter.personalRelationship,
                  isNearbyRightNow: isNearbyRightNowUpdate.value as boolean,
                },
              }
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
