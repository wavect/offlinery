import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { AuthApi, AuthControllerSignInRequest } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTextInputWide } from "@/components/OTextInputWide/OTextInputWide";
import { OTroubleSignIn } from "@/components/OTroubleSignIn/OTroubleSignIn";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { userAuthenticatedUpdate } from "@/services/auth.service";
import * as React from "react";
import { useState } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";

const { width, height } = Dimensions.get("window");
const authApi = new AuthApi();
const Login = ({ navigation }) => {
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
            const signInRes = await authApi.authControllerSignIn(signInDTO);

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

    return (
        <OPageColorContainer>
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
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            <OTermsDisclaimer style={styles.termsDisclaimer} />

            <OTroubleSignIn />
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
        color: Color.redLight,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "center",
        marginBottom: height * 0.01,
    },
});

export default Login;
