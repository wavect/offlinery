import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import {Color, Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, Gender, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";

const GenderLookingFor = ({navigation}) => {
    const { dispatch } = useUserContext();

    const setGender = (gender: Gender) => {
        dispatch({ type: EACTION_USER.ADD_GENDER_DESIRE, payload: gender})
        navigation.navigate(ROUTES.Onboarding.AddPhotos)
    }

    return <OPageContainer title="I look for">
        <View style={styles.optionContainer}>
            <OButtonWide text="Women" filled={false} variant="dark" onPress={() => setGender("woman")} />
        </View>

        <View style={styles.optionContainer}>
            <OButtonWide text="Men" filled={false} variant="dark" onPress={() => setGender("man")}/>
        </View>

        <View style={styles.optionContainer}>
            <OButtonWide text="More" filled={false} variant="dark" disabled={true} />
            <Text style={[Subtitle, styles.subtitle]}>
                We will be adding this option as soon as possible. You will have the option later on to change this to something you truly identify with.
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