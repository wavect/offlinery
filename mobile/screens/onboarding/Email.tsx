import { Color, FontFamily } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OCheckbox } from "@/components/OCheckbox/OCheckbox";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { isValidEmail } from "@/utils/validation-rules.utils";
import * as React from "react";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const Email = ({
    route,
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.Email
>) => {
    const { state, dispatch } = useUserContext();
    const [showErrorMessage, setShowErrorMessage] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            const params = route.params;
            if (params?.errorMessage) {
                setErrorMessage(params.errorMessage);
                setShowErrorMessage(true);
            }
        });

        return unsubscribe;
    }, [navigation, route]);

    const setEmail = (email: string) => {
        setShowErrorMessage(false);
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { email } });
    };

    const setCheckboxChecked = (wantsEmailUpdates: boolean) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { wantsEmailUpdates },
        });
    };

    const onContinue = async () => {
        navigation.navigate(ROUTES.Onboarding.VerifyEmail);
    };

    return (
        <OPageContainer
            title={i18n.t(TR.whatIsYourEmail)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    disabled={!isValidEmail(state.email)}
                    variant="dark"
                    onPress={onContinue}
                />
            }
            subtitle={i18n.t(TR.whatIsYourEmailDescr)}
        >
            <OTextInput
                value={state.email}
                setValue={setEmail}
                placeholder={i18n.t(TR.yourEmail)}
                style={styles.inputField}
            />
            {showErrorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
            <OCheckbox
                onValueChange={setCheckboxChecked}
                checkboxState={state.wantsEmailUpdates}
                label={i18n.t(TR.wantToReceiveNews)}
            />
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
    },
    content: {
        flex: 1,
    },
    inputField: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        alignItems: "center",
    },
    errorMessage: {
        color: Color.redLight,
        fontSize: 16,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "center",
        marginBottom: 10,
    },
});

export default Email;
