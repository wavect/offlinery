import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTroubleMessage } from "@/components/OTroubleMessage/OTroubleMessage";
import { isAuthenticated, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { userAuthenticatedUpdate } from "@/services/auth.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { API } from "@/utils/api-config";
import { writeSupportEmail } from "@/utils/misc.utils";
import { useFocusEffect } from "@react-navigation/native";
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

    const checkAuthStatus = async () => {
        try {
            const accessToken = getSecurelyStoredValue(
                SECURE_VALUE.JWT_ACCESS_TOKEN,
            );
            if (!accessToken) {
                console.log("forcing re-login");
                return;
            }
            const resp = await API.auth.authControllerSignInByJWT({
                signInJwtDTO: { jwtAccessToken: accessToken },
            });
            console.log("JWT authentication succeeded");
            userAuthenticatedUpdate(
                dispatch,
                navigation,
                resp.user,
                resp.accessToken,
                resp.refreshToken,
            );
        } catch (error) {
            saveValueLocallySecurely(SECURE_VALUE.JWT_ACCESS_TOKEN, "");
            saveValueLocallySecurely(SECURE_VALUE.JWT_REFRESH_TOKEN, "");
            console.log("Forcing user to re-login.");
        }

        return isAuthenticated();
    };
    useFocusEffect(
        useCallback(() => {
            const checkAuthentication = async () => {
                try {
                    await checkAuthStatus();
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
            {!isAuthenticated() && <AuthScreen />}
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
