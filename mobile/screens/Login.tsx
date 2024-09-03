import { Color, FontFamily } from "@/GlobalStyles";
import {
    AuthApi,
    AuthControllerSignInRequest,
    UserPrivateDTO,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OShowcase } from "@/components/OShowcase/OShowcase";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTextInputWide } from "@/components/OTextInputWide/OTextInputWide";
import { OTroubleSignIn } from "@/components/OTroubleSignIn/OTroubleSignIn";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import * as React from "react";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ROUTES } from "./routes";

const authApi = new AuthApi();
const Login = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const userAuthenticatedUpdate = (
        user: UserPrivateDTO,
        jwtAccessToken: string,
    ) => {
        // also fill userData when logged in
        // Note: We still save the accessToken into the user context to avoid reading from secure storage all the time when making api requests (performance, security, ..)
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: {
                jwtAccessToken,
                ...(user as any),
                // TODO: Not working yet, ..user is too different! e.g. images
            },
        });

        if (user.verificationStatus === "pending") {
            navigation.navigate(ROUTES.Onboarding.WaitingVerification);
        } else {
            navigation.navigate(ROUTES.MainTabView);
        }
    };

    useEffect(() => {
        getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN).then(
            async (jwtAccessToken) => {
                if (!jwtAccessToken) {
                    // needs to authenticate regularly
                    return;
                } else {
                    const signInRes = await authApi.authControllerSignInByJWT({
                        signInJwtDTO: {
                            jwtAccessToken,
                        },
                    });
                    if (signInRes.accessToken) {
                        // still defined
                        userAuthenticatedUpdate(
                            signInRes.user,
                            signInRes.accessToken,
                        );
                    }
                }
            },
        );
    }, []);

    const login = async () => {
        setLoading(true);
        setErrorMessage(""); // Reset the error message

        const signInDTO: AuthControllerSignInRequest = {
            signInDTO: {
                email: state.email,
                clearPassword: state.clearPassword,
            },
        };
        try {
            const signInRes = await authApi.authControllerSignIn(signInDTO);
            if (signInRes.accessToken) {
                // everything seems to be valid
                const user = signInRes.user;

                // save jwtAccessToken in secure storage to stay logged in if app is closed
                await saveValueLocallySecurely(
                    SECURE_VALUE.JWT_ACCESS_TOKEN,
                    signInRes.accessToken,
                );

                userAuthenticatedUpdate(user, signInRes.accessToken);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(i18n.t(TR.invalidCredentials));
        } finally {
            // always stop loading
            setLoading(false);
            /** @dev Delete clear password once logged in */
            setClearPassword("");
        }
    };

    const hasFilledOutLoginForm = () => {
        return state.email.length && state.clearPassword.length;
    };
    const setEmail = (email: string) => {
        dispatch({ type: EACTION_USER.SET_EMAIL, payload: email });
    };
    const setClearPassword = (clearPassword: string) => {
        dispatch({
            type: EACTION_USER.SET_CLEAR_PASSWORD,
            payload: clearPassword,
        });
    };

    return (
        <OLinearBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.content}>
                        <OShowcase subtitle={i18n.t(TR.stopSwipingMeetIrl)} />

                        <OTextInputWide
                            value={state.email}
                            setValue={setEmail}
                            placeholder={i18n.t(TR.yourEmail)}
                            topLabel={i18n.t(TR.email)}
                            style={styles.textInputContainer}
                        />
                        <OTextInputWide
                            value={state.clearPassword}
                            setValue={setClearPassword}
                            placeholder={i18n.t(TR.yourPassword)}
                            secureTextEntry={true}
                            topLabel={i18n.t(TR.password)}
                            style={styles.textInputContainer}
                        />

                        <OButtonWide
                            filled={true}
                            text={i18n.t(TR.signIn)}
                            style={styles.loginButton}
                            isLoading={isLoading}
                            loadingBtnText={i18n.t(TR.signingIn)}
                            disabled={!hasFilledOutLoginForm()}
                            onPress={login}
                            variant="light"
                        />
                        {errorMessage ? (
                            <Text style={styles.errorMessage}>
                                {errorMessage}
                            </Text>
                        ) : null}

                        <OTermsDisclaimer style={styles.termsDisclaimer} />

                        <OTroubleSignIn />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    content: {
        alignItems: "center",
        paddingVertical: 20,
    },
    textInputContainer: {
        marginBottom: 20,
        width: "100%",
    },
    loginButton: {
        marginBottom: 14,
        width: "90%",
    },
    termsDisclaimer: {
        marginTop: 20,
        color: Color.white,
    },
    errorMessage: {
        color: Color.redLight,
        fontSize: 16,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "center",
        marginBottom: 10,
    },
});

export default Login;
