import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import {Color, Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, Gender, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {i18n, TR} from "../../localization/translate.service";

const GenderLookingFor = ({navigation}) => {
    const { dispatch } = useUserContext();

    const setGender = (gender: Gender) => {
        dispatch({ type: EACTION_USER.SET_GENDER_DESIRE, payload: gender})
        navigation.navigate(ROUTES.Onboarding.AddPhotos)
    }

    return <OPageContainer title={i18n.t(TR.iLookFor)}>
        <View style={styles.optionContainer}>
            <OButtonWide text={i18n.t(TR.women)} filled={false} variant="dark" onPress={() => setGender("woman")} />
        </View>

        <View style={styles.optionContainer}>
            <OButtonWide text={i18n.t(TR.men)} filled={false} variant="dark" onPress={() => setGender("man")}/>
        </View>

        <View style={styles.optionContainer}>
            <OButtonWide text={i18n.t(TR.more)} filled={false} variant="dark" disabled={true} />
            <Text style={[Subtitle, styles.subtitle]}>
                {i18n.t(TR.genderMoreComingSoon)}
            </Text>
        </View>
    </OPageContainer>
};

const styles = StyleSheet.create({
    optionContainer: {
        alignItems: 'center',
        marginTop: 60,
        width: '100%',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default GenderLookingFor;