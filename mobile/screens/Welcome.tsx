import { MainStackParamList } from "@/MainStack.navigator";
import { SignInResponseDTOStatusEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTroubleMessage } from "@/components/OTroubleMessage/OTroubleMessage";
import {
    EACTION_USER,
    IUserData,
    isAuthenticated,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { userAuthenticatedUpdate } from "@/services/auth.service";
import {
    LOCAL_VALUE,
    deleteOnboardingState,
    getLocalValue,
    saveJWTValues,
} from "@/services/storage.service";
import { OBackgroundLocationService } from "@/tasks/location.task";
import { API } from "@/utils/api-config";
import { writeSupportEmail } from "@/utils/misc.utils";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { useCallback, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "./routes";

const Welcome = ({
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.Welcome>) => {
    const { dispatch } = useUserContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const accessToken = await getLocalValue(
                LOCAL_VALUE.JWT_ACCESS_TOKEN,
            );
            if (!accessToken) {
                console.log("forcing re-login");
                await OBackgroundLocationService.getInstance().stop();
                return;
            }
            const resp = await API.auth.authControllerSignInByJWT({
                signInJwtDTO: { jwtAccessToken: accessToken },
            });

            if (
                resp.status === SignInResponseDTOStatusEnum.JWT_DECODE_ERROR ||
                resp.status === SignInResponseDTOStatusEnum.JWT_INVALID
            ) {
                /** @DEV only reset storage if invalid jwt received */
                await saveJWTValues("", "");
                await OBackgroundLocationService.getInstance().stop();
            }

            await deleteOnboardingState();

            await userAuthenticatedUpdate(
                dispatch,
                navigation,
                resp.user,
                resp.accessToken,
                resp.refreshToken,
            );
        } catch (error) {
            console.log(
                `Error checking Auth Status, User might be offline or backend not reachable.`,
            );
            Sentry.captureException(error, {
                tags: {
                    authStatus: "JWT not checked",
                },
            });
        }

        return await isAuthenticated();
    };
    useFocusEffect(
        useCallback(() => {
            const checkAuthentication = async () => {
                try {
                    if (!(await isOnboardingInProgress())) {
                        const isAuthSuccessful = await checkAuthStatus();
                        setIsUserAuthenticated(isAuthSuccessful ?? false);
                    }
                } catch (error) {
                    console.error("Error checking authentication:", error);
                    throw error;
                } finally {
                    setIsLoading(false);
                }
            };

            checkAuthentication();
        }, [navigation]),
    );

    const isOnboardingInProgress = async () => {
        const savedUser = await getLocalValue(LOCAL_VALUE.ONBOARDING_USER);
        return !!savedUser;
    };

    const restoreOnboarding = async () => {
        const savedUser = await getLocalValue(LOCAL_VALUE.ONBOARDING_USER);
        const savedStack = await getLocalValue(LOCAL_VALUE.ONBOARDING_SCREEN);
        if (!savedUser || !savedStack) {
            return;
        }
        await deleteOnboardingState();

        const userParsed = JSON.parse(savedUser) as IUserData;
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: {
                ...userParsed,
                approachFromTime: new Date(userParsed.approachFromTime),
                approachToTime: new Date(userParsed.approachToTime),
                birthDay: new Date(userParsed.birthDay),
            },
        });
        const parsedStack = JSON.parse(savedStack);
        const restoredRoutes = parsedStack.routes as {
            name: string;
            params?: unknown[];
        }[];

        const filteredRoutes = restoredRoutes
            .map((r) => ({
                name: r.name,
                params: r.params,
            }))
            .filter((r) => r.name !== ROUTES.Onboarding.VerifyEmail)
            .reduce(
                (acc, current) => {
                    if (!acc.find((item) => item.name === current.name)) {
                        acc.push(current);
                    }
                    return acc;
                },
                [] as { name: string; params?: unknown[] }[],
            );

        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: filteredRoutes,
            }),
        );
    };

    React.useEffect(() => {
        restoreOnboarding();
    }, []);

    const AuthScreen = () => (
        <View style={styles.authContainer}>
            <OTermsDisclaimer />
            <View style={styles.buttonContainer}>
                <OButtonWide
                    filled={true}
                    text={i18n.t(TR.createAccount)}
                    onPress={() => navigation.navigate(ROUTES.Onboarding.Email)}
                    variant="light"
                    style={styles.button}
                />
                <OButtonWide
                    filled={false}
                    text={i18n.t(TR.signIn)}
                    variant="light"
                    onPress={() => navigation.navigate(ROUTES.Login)}
                    style={styles.button}
                />
            </View>
            <OTroubleMessage
                style={styles.troubleSigningIn}
                action={writeSupportEmail}
                label={i18n.t(TR.contactSupport)}
            />
        </View>
    );

    return (
        <OPageColorContainer isLoading={isLoading}>
            {!isUserAuthenticated && <AuthScreen />}
        </OPageColorContainer>
    );
};

const { width, height } = Dimensions.get("window");
const aspectRatio = height / width;

const styles = StyleSheet.create({
    authContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: Platform.OS === "ios" ? "8%" : "5%",
    },
    buttonContainer: {
        width: "100%",
        paddingHorizontal: "5%",
        marginTop: aspectRatio > 1.6 ? "5%" : "2%",
    },
    button: {
        marginBottom: 14,
        width: "100%",
    },
    troubleSigningIn: {
        width: "90%",
        marginTop: aspectRatio > 1.6 ? 22 : 10,
        marginBottom: 10,
    },
});

export default Welcome;
