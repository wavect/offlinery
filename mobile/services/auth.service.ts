import { UserPrivateDTO } from "@/api/gen/src";
import {
    EACTION_USER,
    IUserAction,
    IUserData,
    mapBlacklistedRegionDTOToMapRegion,
    MapRegion,
} from "@/context/UserContext";
import { ROUTES } from "@/screens/routes";
import { Dispatch } from "react";

export const refreshUserData = (
    dispatch: Dispatch<IUserAction>,
    user: UserPrivateDTO,
    jwtAccessToken?: string,
    jwtRefreshToken?: string,
) => {
    // also fill userData when logged in
    // Note: We still save the accessToken into the user context to avoid reading from secure storage all the time when making api requests (performance, security, ..)
    const payload: Partial<IUserData> = {
        ...user,
        approachFromTime: new Date(user.approachFromTime),
        approachToTime: new Date(user.approachToTime),
        blacklistedRegions: user.blacklistedRegions
            .map((br) => {
                return mapBlacklistedRegionDTOToMapRegion(br);
            })
            .filter((br) => !br) as MapRegion[],
        clearPassword: "",
        imageURIs: Object.fromEntries(
            user.imageURIs.map((value, index) => [index, value]),
        ),
    };

    if (jwtAccessToken) {
        payload.jwtAccessToken = jwtAccessToken;
    }
    if (jwtRefreshToken) {
        payload.refreshToken = jwtRefreshToken;
    }

    dispatch({
        type: EACTION_USER.UPDATE_MULTIPLE,
        payload,
    });
};

export const userAuthenticatedUpdate = (
    dispatch: Dispatch<IUserAction>,
    navigation: any,
    user: UserPrivateDTO,
    jwtAccessToken: string,
    jwtRefreshToken: string,
) => {
    refreshUserData(dispatch, user, jwtAccessToken, jwtRefreshToken);

    if (user.verificationStatus === "pending") {
        navigation.navigate(ROUTES.MainTabView);
        navigation.navigate(ROUTES.Onboarding.WaitingVerification);
    } else {
        navigation.navigate(ROUTES.MainTabView);
    }
};
