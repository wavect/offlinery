import { MainStackParamList } from "@/MainStack.navigator";
import { AuthApi, AuthControllerSignInRequest } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import { OTroubleSignIn } from "@/components/OTroubleSignIn/OTroubleSignIn";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { userAuthenticatedUpdate } from "@/services/auth.service";
import { SText } from "@/styles/Text.styles";
import { StyledLoginContainer } from "@/styles/View.styles";
import { isValidEmail } from "@/utils/validation-rules.utils";
import * as React from "react";
import { useState } from "react";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const authApi = new AuthApi();

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

    const showInvalidEmailError = state.email && !isValidEmail(state.email);

    return (
        <OPageColorContainer>
            <StyledLoginContainer>
                <OTextInput
                    variant="white"
                    value={state.email}
                    maxLength={100}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    autoCorrect={false}
                    autoFocus={true}
                    inputMode="email"
                    isBottomLabelError={true}
                    bottomLabel={
                        showInvalidEmailError
                            ? i18n.t(TR.invalidEmail)
                            : undefined
                    }
                    onChangeText={setEmail}
                    placeholder={i18n.t(TR.yourEmail)}
                    topLabel={i18n.t(TR.email)}
                />
                <OTextInput
                    variant="white"
                    value={state.clearPassword}
                    maxLength={100}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    inputMode="text"
                    autoCorrect={false}
                    keyboardType="default"
                    onChangeText={setClearPassword}
                    placeholder={i18n.t(TR.yourPassword)}
                    isPassword={true}
                    topLabel={i18n.t(TR.password)}
                />
            </StyledLoginContainer>

            {errorMessage ? <SText.Error>{errorMessage}</SText.Error> : null}

            <OButtonWide
                filled={true}
                text={i18n.t(TR.signIn)}
                isLoading={isLoading}
                loadingBtnText={i18n.t(TR.signingIn)}
                disabled={!hasFilledOutLoginForm()}
                onPress={login}
                variant="light"
            />
            <OTermsDisclaimer />
            <OTroubleSignIn />
        </OPageColorContainer>
    );
};

export default Login;
