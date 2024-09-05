import { IUserData } from "@/context/UserContext";
import {
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { isComplete } from "@/utils/misc.utils";

/** @dev React-native-mmkv is blazing fast as it uses native modules. For that reason it does not work with Expo Go. To keep Expo Go working, we fallback to secure service if not available. */
const getStorageLib = () => {
    try {
        // extra encryption, if we are paranoid: https://github.com/Tencent/MMKV/wiki/android_advance#encryption (also for ios)
        // @dev For sensitive values like the JWToken please use the secure-storage.service.ts (slightly slower)

        // Try to use MMKV in development on native platforms
        const MMKV = require("react-native-mmkv").MMKV;
        return new MMKV();
    } catch {
        // Fallback to SecureStore if MMKV is not available (e.g., in Expo Go)
        return false;
    }
};
/** @dev If MMKV store defined use it, otherwise is false to use secure-service instead. */
const storage = getStorageLib();

export const LOCAL_VALUE = {
    USER_DATA: "user_data",
    ENCOUNTERS: "encounters",
};

export const getLocallyStoredUserData = (): Omit<
    IUserData,
    "jwtAccessToken"
> | null => {
    let userDataString: string | null;
    if (!storage) {
        userDataString = getSecurelyStoredValue(LOCAL_VALUE.USER_DATA);
    } else {
        userDataString = storage.getString(LOCAL_VALUE.USER_DATA);
    }
    return userDataString ? (JSON.parse(userDataString) as IUserData) : null;
};

export const updateUserDataLocally = (
    partialUserData: Omit<Partial<IUserData>, "jwtAccessToken">,
) => {
    if (isComplete<Omit<IUserData, "jwtAccessToken">>(partialUserData)) {
        saveUserData(
            partialUserData satisfies Omit<IUserData, "jwtAccessToken">,
        );
    } else {
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
    }
};

export const saveUserData = (userData: Omit<IUserData, "jwtAccessToken">) => {
    // jwtAccessToken should be stored in more secure local storage, see secure-storage.service.ts
    if ((userData as IUserData).jwtAccessToken) {
        // if the type check didn't work, we manually delete the jwt token from the object to not save it.
        (userData as IUserData).jwtAccessToken = undefined;
    }

    const userDataString = JSON.stringify(userData);
    if (!storage) {
        saveValueLocallySecurely(LOCAL_VALUE.USER_DATA, userDataString);
    } else {
        storage.set(LOCAL_VALUE.USER_DATA, userDataString);
    }
};

export const getLocallyStoredEncounters = (): IEncounterProfile[] => {
    let encounterDataString: string | null;
    if (!storage) {
        encounterDataString = getSecurelyStoredValue(LOCAL_VALUE.ENCOUNTERS);
    } else {
        encounterDataString = storage.getString(LOCAL_VALUE.ENCOUNTERS);
    }
    return encounterDataString
        ? (JSON.parse(encounterDataString) as IEncounterProfile[])
        : [];
};

/** @dev Since encounters is an array, we always update the full storage directly in Encounters.context.ts */
export const saveEncountersLocally = (encounters: IEncounterProfile[]) => {
    const encounterDataString = JSON.stringify(encounters);
    if (!storage) {
        saveValueLocallySecurely(LOCAL_VALUE.ENCOUNTERS, encounterDataString);
    } else {
        storage.set(LOCAL_VALUE.ENCOUNTERS, encounterDataString);
    }
};
