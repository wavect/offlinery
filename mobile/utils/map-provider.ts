import { isExpoGoEnvironment } from "@/utils/misc.utils";
import { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

export const getMapProvider = () => {
    if (isExpoGoEnvironment) {
        return PROVIDER_DEFAULT;
    } else {
        return PROVIDER_GOOGLE;
    }
};
