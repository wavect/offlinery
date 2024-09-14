import { MainStackParamList } from "@/MainStack.navigator";
import { UserGenderEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { SSubtitle } from "@/styles/Text.styles";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const GenderChoice = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.GenderChoice
>) => {
    const { dispatch } = useUserContext();

    const setGender = (gender: UserGenderEnum) => {
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { gender } });
        navigation.navigate(ROUTES.Onboarding.GenderLookingFor);
    };

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
                <SSubtitle>{i18n.t(TR.genderMoreComingSoon)}</SSubtitle>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    optionContainer: {
        alignItems: "center",
        marginTop: 60,
        width: "100%",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default GenderChoice;
