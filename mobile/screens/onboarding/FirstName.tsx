import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import * as React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const FirstName = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.FirstName
>) => {
    const { state, dispatch } = useUserContext();

    const setFirstName = (firstName: string) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { firstName },
        });
    };
    const isValidFirstName = () => {
        return state.firstName.length > 2;
    };

    return (
        <OPageContainer
            fullpageIcon="person"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    disabled={!isValidFirstName()}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.BirthDay)
                    }
                />
            }
            subtitle={i18n.t(TR.myFirstNameDescr)}
        >
            <View style={styles.inputField}>
                <TextInput
                    style={styles.input}
                    value={state.firstName}
                    onChangeText={setFirstName}
                    maxLength={100}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    inputMode="text"
                    autoCorrect={false}
                    keyboardType="default"
                    placeholder={i18n.t(TR.enterFirstName)}
                    placeholderTextColor="#999"
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
