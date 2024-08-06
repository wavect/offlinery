import * as React from "react";
import {useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View} from "react-native";
import {Color, FontFamily} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {ROUTES} from "./routes";
import {EACTION_USER, useUserContext} from "../context/UserContext";
import {sleep} from "../utils/misc.utils";
import {OTermsDisclaimer} from "../components/OTermsDisclaimer/OTermsDisclaimer";
import {OTextInputWide} from "../components/OTextInputWide/OTextInputWide";
import {i18n, TR} from "../localization/translate.service";

const Login = ({navigation}) => {

    const {state, dispatch} = useUserContext()
    const [isLoading, setLoading] = useState(false)

    // TODO: Dispatch isAuthenticated + fill userData when logged in
    const login = async () => {
        setLoading(true)

        try {
            await sleep(2000)
            // TODO: on success
            navigation.navigate(ROUTES.MainTabView)
        } catch (err) {
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
});


export default Login;
