import { Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserPrivateDTOGenderEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/services/storage.service";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const GenderChoice = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.GenderChoice
>) => {
    const { state, dispatch } = useUserContext();

    const setGender = (gender: UserPrivateDTOGenderEnum) => {
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { gender } });
        navigation.navigate(ROUTES.Onboarding.IntentionsChoice);
    };

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    return (
        <OPageContainer fullpageIcon="transgender">
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.woman)}
                    filled={false}
                    variant="dark"
                    onPress={() => setGender("woman")}
                />
            </View>

            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.man)}
                    filled={false}
                    variant="dark"
                    onPress={() => setGender("man")}
                />
            </View>

            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.more)}
                    filled={false}
                    variant="dark"
                    disabled={true}
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.genderMoreComingSoon)}
                </Text>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    optionContainer: {
        alignItems: "center",
        marginTop: 20,
        width: "100%",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default GenderChoice;
