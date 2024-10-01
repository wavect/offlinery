import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { AuthControllerSignInRequest } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTextInputWide } from "@/components/OTextInputWide/OTextInputWide";
import { OTroubleMessage } from "@/components/OTroubleSignIn/OTroubleMessage";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { userAuthenticatedUpdate } from "@/services/auth.service";
import { API } from "@/utils/api-config";
import { isValidEmail } from "@/utils/validation-rules.utils";
import * as React from "react";
import { useState } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const { width, height } = Dimensions.get("window");
const Login = ({
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.Login>) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const login = async () => {
        setLoading(true);
        setErrorMessage("");

        const signInDTO: AuthControllerSignInRequest = {
            signInDTO: {
                email: state.email,
                clearPassword: state.clearPassword,
            },
        };

        try {
            const signInRes = await API.auth.authControllerSignIn(signInDTO);

            if (signInRes.accessToken) {
                const user = signInRes.user;
                userAuthenticatedUpdate(
                    dispatch,
                    navigation,
                    user,
                    signInRes.accessToken,
                    signInRes.refreshToken,
                );
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(i18n.t(TR.invalidCredentials));
        } finally {
            setLoading(false);
            setClearPassword("");
        }
    };

    const hasFilledOutLoginForm = () => {
        return state.email.length && state.clearPassword.length;
    };
    const setEmail = (email: string) => {
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { email } });
    };
    const setClearPassword = (clearPassword: string) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { clearPassword },
        });
    };

    const startResetPassword = () => {
        navigation.navigate(ROUTES.ResetPassword);
    };

    const showInvalidEmailError = state.email && !isValidEmail(state.email);
    return (
        <OPageColorContainer>
            <OTextInputWide
                value={state.email}
                maxLength={125}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                autoCorrect={false}
                inputMode="email"
                isBottomLabelError={true}
                bottomLabel={
                    showInvalidEmailError ? i18n.t(TR.invalidEmail) : undefined
                }
                onChangeText={setEmail}
                placeholder={i18n.t(TR.yourEmail)}
                topLabel={i18n.t(TR.email)}
                containerStyle={[
                    styles.textInputContainer,
                    showInvalidEmailError ? { marginBottom: 0 } : undefined,
                ]}
            />
            <OTextInputWide
                value={state.clearPassword}
                maxLength={100}
                autoCapitalize="none"
                autoComplete="current-password"
                inputMode="text"
                autoCorrect={false}
                keyboardType="default"
                onChangeText={setClearPassword}
                placeholder={i18n.t(TR.yourPassword)}
                isSensitiveInformation={true}
                topLabel={i18n.t(TR.password)}
                containerStyle={styles.textInputContainer}
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
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            <OTermsDisclaimer style={styles.termsDisclaimer} />

            <OTroubleMessage
                style={styles.troubleSignIn}
                action={startResetPassword}
                label={i18n.t(TR.passwordForgotten)}
            />
        </OPageColorContainer>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    troubleSignIn: {
        marginBottom: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.03,
    },
    content: {
        alignItems: "center",
        width: "100%",
    },
    textInputContainer: {
        marginBottom: height * 0.02,
        width: "100%",
    },
    loginButton: {
        marginBottom: height * 0.015,
        width: "100%",
    },
    termsDisclaimer: {
        marginTop: height * 0.02,
        color: Color.white,
    },
    errorMessage: {
        color: Color.lightOrange,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "center",
        marginBottom: height * 0.01,
    },
});

export default Login;
