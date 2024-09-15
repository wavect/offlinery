import Constants from "expo-constants";
import { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

export const isExpoGoEnvironment = Constants.appOwnership === "expo";

export const getMapProvider = () => {
    if (isExpoGoEnvironment) {
        return PROVIDER_DEFAULT;
    } else {
        return PROVIDER_GOOGLE;
    }
};
