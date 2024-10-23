import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import OErrorMessage from "@/components/OErrorMessage.tsx/OErrorMessage";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/utils/misc.utils";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

const FirstName = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.FirstName
>) => {
    const { state, dispatch } = useUserContext();

    const {
        control,
        formState: { errors, isValid, dirtyFields },
        trigger,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            firstName: state.firstName || "",
        },
    });

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    const isFormValid =
        isValid &&
        dirtyFields.firstName &&
        state.firstName?.trim().length >= MIN_LENGTH;

    const setFirstName = (firstName: string) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { firstName },
        });
    };

    React.useEffect(() => {
        trigger("firstName");
    }, [trigger]);

    return (
        <OPageContainer
            fullpageIcon="person"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    disabled={!isFormValid}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.BirthDay)
                    }
                />
            }
            subtitle={i18n.t(TR.myFirstNameDescr)}
        >
            <View style={styles.inputField}>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        maxLength: MAX_LENGTH,
                        minLength: MIN_LENGTH,
                    }}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text);
                                setFirstName(text);
                            }}
                            maxLength={100}
                            autoCapitalize="words"
                            autoComplete="given-name"
                            inputMode="text"
                            autoCorrect={false}
                            keyboardType="default"
                            placeholder={i18n.t(TR.enterFirstName)}
                            placeholderTextColor="#999"
                        />
                    )}
                />
                <OErrorMessage
                    errorMessage={i18n.t(TR.inputInvalid)}
                    show={
                        (dirtyFields.firstName ?? false) &&
                        errors.firstName !== undefined
                    }
                />
            </View>
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
    checkboxField: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        marginLeft: 10,
    },
    buttonContainer: {
        alignItems: "center",
    },
});

export default FirstName;
