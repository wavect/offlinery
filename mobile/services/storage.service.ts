import { IUserData } from "@/context/UserContext";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { MMKV } from "react-native-mmkv";

// extra encryption, if we are paranoid: https://github.com/Tencent/MMKV/wiki/android_advance#encryption (also for ios)
// @dev For sensitive values like the JWToken please use the secure-storage.service.ts (slightly slower)
const storage = new MMKV();

export const LOCAL_VALUE = {
    USER_DATA: "user_data",
    ENCOUNTERS: "encounters",
};

export const getLocallyStoredUserData = (): Omit<
    IUserData,
    "jwtAccessToken"
> | null => {
    const userDataString = storage.getString(LOCAL_VALUE.USER_DATA);
    return userDataString ? (JSON.parse(userDataString) as IUserData) : null;
};

export const updateUserDataLocally = (
    partialUserData: Omit<Partial<IUserData>, "jwtAccessToken">,
) => {
    const currentUserData = getLocallyStoredUserData();
    if (!currentUserData) {
        throw new Error(
            "updateUserDataSecurely: Use saveUserDataSecurely instead first time!",
        );
    }
    const updatedUserData: Omit<IUserData, "jwtAccessToken"> = {
        ...currentUserData,
        ...partialUserData,
    };
    saveUserData(updatedUserData);
};

export const saveUserData = (userData: Omit<IUserData, "jwtAccessToken">) => {
    // jwtAccessToken should be stored in more secure local storage, see secure-storage.service.ts
    if ((userData as IUserData).jwtAccessToken) {
        // if the type check didn't work, we manually delete the jwt token from the object to not save it.
        (userData as IUserData).jwtAccessToken = undefined;
    }

    const userDataString = JSON.stringify(userData);
    storage.set(LOCAL_VALUE.USER_DATA, userDataString);
};

export const getLocallyStoredEncounters = (): IEncounterProfile[] => {
    const encounterDataString = storage.getString(LOCAL_VALUE.ENCOUNTERS);
    return encounterDataString
        ? (JSON.parse(encounterDataString) as IEncounterProfile[])
        : [];
};

export const saveEncountersLocally = (encounters: IEncounterProfile[]) => {
    storage.set(LOCAL_VALUE.ENCOUNTERS, JSON.stringify(encounters));
};
