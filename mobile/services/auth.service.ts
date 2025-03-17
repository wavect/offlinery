import {
    CreateUserDTO,
    UserControllerCreateUserRequest,
    UserPrivateDTO,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTOVerificationStatusEnum,
} from "@/api/gen/src";
import {
    EACTION_USER,
    IUserAction,
    IUserData,
    MapRegion,
    getUserImagesForUpload,
    mapBlacklistedRegionDTOToMapRegion,
    mapRegionToBlacklistedRegionDTO,
} from "@/context/UserContext";
import { getLocalLanguageID } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import {
    LOCAL_VALUE,
    deleteOnboardingState,
    saveLocalValue,
} from "@/services/storage.service";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import React, { Dispatch } from "react";

export const refreshUserData = async (
    dispatch: Dispatch<IUserAction>,
    user: UserPrivateDTO,
    jwtAccessToken?: string,
    jwtRefreshToken?: string,
) => {
    // also fill userData when logged in
    // Note: We still save the accessToken into the user context to avoid reading from secure storage all the time when making api requests (performance, security, ..)
    const payload: Partial<IUserData> = {
        ...user,
        approachFromTime: user ? new Date(user.approachFromTime) : undefined,
        approachToTime: user ? new Date(user.approachToTime) : undefined,
        blacklistedRegions: user
            ? (user.blacklistedRegions
                  .map((br) => {
                      return mapBlacklistedRegionDTOToMapRegion(br);
                  })
                  .filter((br) => br) as MapRegion[])
            : [],
        clearPassword: "",
        imageURIs: user
            ? Object.fromEntries(
                  user.imageURIs.map((value, index) => [index, value]),
              )
            : {},
    };

    dispatch({
        type: EACTION_USER.UPDATE_MULTIPLE,
        payload,
    });

    if (jwtAccessToken) {
        await saveLocalValue(LOCAL_VALUE.JWT_ACCESS_TOKEN, jwtAccessToken);
    }
    if (jwtRefreshToken) {
        await saveLocalValue(LOCAL_VALUE.JWT_REFRESH_TOKEN, jwtRefreshToken);
    }
};

export const registerUser = async (
    state: IUserData,
    dispatch: React.Dispatch<IUserAction>,
    onSuccess: () => void,
    onError: (err: any) => void,
) => {
    // Prepare the user data
    const userData: CreateUserDTO = {
        firstName: state.firstName,
        clearPassword: state.clearPassword,
        email: state.email,
        wantsEmailUpdates: state.wantsEmailUpdates,
        birthDay: state.birthDay,
        gender: state.gender!,
        genderDesire: state.genderDesire!,
        intentions: state.intentions!,
        approachChoice: state.approachChoice,
        blacklistedRegions: state.blacklistedRegions.map((r) =>
            mapRegionToBlacklistedRegionDTO(r),
        ),
        approachFromTime: state.approachFromTime,
        approachToTime: state.approachToTime,
        bio: state.bio,
        dateMode: state.dateMode,
        preferredLanguage: getLocalLanguageID(),
    };

    const requestParameters: UserControllerCreateUserRequest = {
        createUserDTO: userData,
        images: await getUserImagesForUpload(state.imageURIs),
    };

    try {
        const signInResponseDTO =
            await API.user.userControllerCreateUser(requestParameters);
        const { user, accessToken, refreshToken } = signInResponseDTO;

        // Navigate to the next screen or update the UI as needed
        onSuccess();

        try {
            await deleteOnboardingState();

            // Update the user state
            await refreshUserData(dispatch, user, accessToken, refreshToken);
        } catch (err) {
            console.error("User registration postWork only failed: ", err);
            Sentry.captureException(err, {
                tags: {
                    userContext: "registration:postWork",
                },
            });
        }
    } catch (error: any) {
        console.error("Error creating user:", error, JSON.stringify(error));
        onError(error);
        Sentry.captureException(error, {
            tags: {
                userContext: "registration",
            },
        });
        // Handle the error (e.g., show an error message to the user)
    }
};

export const userAuthenticatedUpdate = async (
    dispatch: Dispatch<IUserAction>,
    navigation: any,
    user: UserPrivateDTO,
    jwtAccessToken: string,
    jwtRefreshToken: string,
) => {
    await refreshUserData(dispatch, user, jwtAccessToken, jwtRefreshToken);

    if (!user) {
        // @dev do nothing as no user object supplied (otherwise sometimes results in maintenance screen)
        return;
    }

    if (
        user.verificationStatus !==
            UserPrivateDTOVerificationStatusEnum.verified &&
        user.approachChoice !== UserPrivateDTOApproachChoiceEnum.be_approached
    ) {
        navigation.replace(ROUTES.Onboarding.WaitingVerification);
    } else {
        navigation.replace(ROUTES.MainTabView);
    }
};
