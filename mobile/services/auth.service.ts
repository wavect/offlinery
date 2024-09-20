import {
    UserPrivateDTO,
    UserPrivateDTOVerificationStatusEnum,
} from "@/api/gen/src";
import {
    EACTION_USER,
    IUserAction,
    IUserData,
    MapRegion,
    mapBlacklistedRegionDTOToMapRegion,
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
            .filter((br) => br) as MapRegion[],
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
    console.warn("PAYLOAD: ", payload.blacklistedRegions);
};

export const userAuthenticatedUpdate = (
    dispatch: Dispatch<IUserAction>,
    navigation: any,
    user: UserPrivateDTO,
    jwtAccessToken: string,
    jwtRefreshToken: string,
) => {
    refreshUserData(dispatch, user, jwtAccessToken, jwtRefreshToken);

    if (
        user.verificationStatus === UserPrivateDTOVerificationStatusEnum.pending
    ) {
        navigation.navigate(ROUTES.Onboarding.WaitingVerification);
    } else {
        navigation.navigate(ROUTES.MainTabView);
    }
};

export const clearSessionDataFromUserContext = (
    dispatch: Dispatch<IUserAction>,
) => {
    const payload: Partial<IUserData> = {
        jwtAccessToken: undefined,
        refreshToken: undefined,
    };

    dispatch({
        type: EACTION_USER.UPDATE_MULTIPLE,
        payload,
    });
};
