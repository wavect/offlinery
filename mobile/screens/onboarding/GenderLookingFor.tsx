import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Subtitle } from "../../GlobalStyles";
import { UserGenderEnum } from "../../api/gen/src";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "../../context/UserContext";
import { TR, i18n } from "../../localization/translate.service";
import { ROUTES } from "../routes";

const GenderLookingFor = ({ navigation }) => {
    const { dispatch } = useUserContext();

    const setGender = (gender: UserGenderEnum) => {
        dispatch({ type: EACTION_USER.SET_GENDER_DESIRE, payload: gender });
        navigation.navigate(ROUTES.Onboarding.AddPhotos);
    };

    return (
        <OPageContainer title={i18n.t(TR.iLookFor)}>
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.women)}
                    filled={false}
                    variant="dark"
                    onPress={() => setGender("woman")}
                />
            </View>

            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.men)}
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
        marginTop: 60,
        width: "100%",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default GenderLookingFor;
