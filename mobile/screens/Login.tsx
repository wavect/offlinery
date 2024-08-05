import * as React from "react";
import {Text, StyleSheet, View, Platform, KeyboardAvoidingView} from "react-native";
import {Color, FontFamily} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {ROUTES} from "./routes";
import {useUserContext} from "../context/UserContext";
import {sleep} from "../utils/misc.utils";
import {OTermsDisclaimer} from "../components/OTermsDisclaimer/OTermsDisclaimer";
import {useState} from "react";
import {OTextInputWide} from "../components/OTextInputWide/OTextInputWide";

const Login = ({navigation}) => {

    const {state, dispatch} = useUserContext()
    const [isLoading, setLoading] = useState(false)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    // TODO: Dispatch isAuthenticated + fill userData when logged in
    const login = async () => {
        setLoading(true)

        try {
            await sleep(2000)
            // TODO: on success
            navigation.navigate(ROUTES.MainTabView)
        } catch(err) {} finally {
            // always stop loading
            setLoading(false)
        }
    }

    const hasFilledOutLoginForm = () => {
        return email.length && password.length
    }

    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>

                <KeyboardAvoidingView style={styles.keyBoardAvoidingViewContainer}
                                      behavior={Platform.OS === "ios" ? "padding" : "height"}
                                      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 140}>

                    <OShowcase subtitle="Stop Swiping. Meet IRL."/>

                    <OTextInputWide value={email} setValue={setEmail} placeholder="Your email" topLabel="Email"
                                    style={styles.textInputContainer}/>
                    <OTextInputWide value={password} setValue={setPassword} placeholder="Your password"
                                    secureTextEntry={true}
                                    topLabel="Password" style={styles.textInputContainer}/>

                    <OButtonWide filled={true} text="Log in" style={{marginBottom: 14}}
                                 isLoading={isLoading} loadingBtnText='Logging in..'
                                 disabled={!hasFilledOutLoginForm()}
                                 onPress={login} variant="light"/>
                </KeyboardAvoidingView>
                <OTermsDisclaimer style={styles.troubleSigningInFlexBox}/>

                <Text style={[styles.troubleSigningIn, styles.troubleSigningInFlexBox]}>
                    Trouble signing in?
                </Text>
            </View>

        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    keyBoardAvoidingViewContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 'auto',
    },
    textInputContainer: {
        marginBottom: 20,
    },
    troubleSigningInFlexBox: {
        display: "flex",
        letterSpacing: 0,
        color: Color.white,
        textAlign: "center",
        alignItems: "center",
    },
    troubleSigningIn: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 22,
        width: 230,
        height: 45,
        textDecorationLine: "underline",
        fontFamily: FontFamily.montserratLight,
        display: "flex",
        fontWeight: "500",
        justifyContent: "center",
    },
    noWifi1Icon: {
        left: 0,
        width: 53,
        height: 44,
    },
    offlinery: {
        left: 53,
        fontSize: 48,
        fontWeight: "600",
        fontFamily: FontFamily.montserratRegular,
        width: 216,
        height: 54,
        lineHeight: 52,
        display: "flex",
        color: Color.white,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    welcome1: {
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 4,
        elevation: 4,
        shadowOpacity: 1,
        height: 926,
        backgroundColor: "transparent",
        overflow: "hidden",
        width: "100%",
        flex: 1,
    },
    layoutContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
});


export default Login;
