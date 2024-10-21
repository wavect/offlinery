import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OCheckbox } from "@/components/OCheckbox/OCheckbox";
import OErrorMessage from "@/components/OErrorMessage.tsx/OErrorMessage";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { isValidEmail } from "@/utils/validation-rules.utils";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
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

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            email: state.email,
        },
    });

    const setEmail = (email: string) => {
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
            fullpageIcon="alternate-email"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    disabled={Object.keys(errors).length > 0}
                    variant="dark"
                    onPress={handleSubmit(onContinue)}
                />
            }
            subtitle={i18n.t(TR.whatIsYourEmailDescr)}
        >
            <Controller
                control={control}
                rules={{
                    required: true,
                    validate: (email) => isValidEmail(email),
                }}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <OTextInput
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(email: string) => {
                            onChange(email);
                            setEmail(email.trim());
                        }}
                        maxLength={125}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        autoCorrect={false}
                        inputMode="email"
                        placeholder={i18n.t(TR.yourEmail)}
                        containerStyle={[
                            styles.inputField,
                            errors.email ? { marginBottom: 6 } : undefined,
                        ]}
                    />
                )}
            />
            {errors.email && (
                <OErrorMessage errorMessage={i18n.t(TR.invalidEmail)} />
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
});

export default Email;
