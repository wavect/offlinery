import * as React from "react";
import {useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View} from "react-native";
import {Color, FontFamily} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {ROUTES} from "./routes";
import {EACTION_USER, useUserContext} from "../context/UserContext";
import {OTermsDisclaimer} from "../components/OTermsDisclaimer/OTermsDisclaimer";
import {OTextInputWide} from "../components/OTextInputWide/OTextInputWide";
import {i18n, TR} from "../localization/translate.service";
import {AuthApi, AuthControllerSignInRequest, SignInDTO} from "../api/gen/src";

const authApi = new AuthApi()
const Login = ({navigation}) => {

    const {state, dispatch} = useUserContext()
    const [isLoading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("");

    const login = async () => {
        setLoading(true)
        setErrorMessage(""); // Reset the error message

        const signInDTO: AuthControllerSignInRequest = {
            signInDTO: {
                email: state.email,
                clearPassword: state.clearPassword,
            }
        }
        try {
            const signInRes = await authApi.authControllerSignIn(signInDTO)
            if (signInRes.accessToken) {
                // everything seems to be valid
                const user = signInRes.user;
                // also fill userData when logged in
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        jwtAccessToken: signInRes.accessToken,
                        ...user as any,
                        // TODO: Not working yet, ..user is too different! e.g. images
                    },
                });
                navigation.navigate(ROUTES.MainTabView)
            }
        } catch (err) {
            setErrorMessage(i18n.t(TR.invalidCredentials));
        } finally {
            // always stop loading
            setLoading(false)
            /** @dev Delete clear password once logged in */
            setClearPassword("")
        }
    }

    const hasFilledOutLoginForm = () => {
        return state.email.length && state.clearPassword.length
    }
    const setEmail = (email: string) => {
        dispatch({type: EACTION_USER.SET_EMAIL, payload: email})
    }
    const setClearPassword = (clearPassword: string) => {
        dispatch({type: EACTION_USER.SET_CLEAR_PASSWORD, payload: clearPassword})
    }

    return (
        <OLinearBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.content}>
                        <OShowcase subtitle={i18n.t(TR.stopSwipingMeetIrl)}/>

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

                        <OTermsDisclaimer style={styles.termsDisclaimer}/>

                        <Text style={styles.troubleSigningIn}>
                            {i18n.t(TR.troubleSignIn)}
                        </Text>
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
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    textInputContainer: {
        marginBottom: 20,
        width: '100%',
    },
    loginButton: {
        marginBottom: 14,
        width: '90%',
    },
    termsDisclaimer: {
        marginTop: 20,
        color: Color.white,
    },
    troubleSigningIn: {
        fontSize: 16,
        lineHeight: 24,
        marginTop: 10,
        textDecorationLine: "underline",
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        color: Color.white,
        textAlign: "center",
    },
    errorMessage: {
        color: Color.red,
        fontSize: 16,
        fontFamily: FontFamily.montserratLight,
        textAlign: "center",
        marginTop: 10,
    },
});


export default Login;
