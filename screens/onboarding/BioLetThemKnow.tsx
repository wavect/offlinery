import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { ROUTES } from "../routes";
import { DEFAULT_FROM_TIME, DEFAULT_TO_TIME, EACTION_USER, useUserContext } from "../../context/UserContext";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {Subtitle} from "../../GlobalStyles";

const MAX_LENGTH_BIO = 60
const BioLetThemKnow = ({ navigation }) => {
    const { state, dispatch } = useUserContext();

    const setBio = (bio: string) => {
        if (bio.length > MAX_LENGTH_BIO) return;
        dispatch({ type: EACTION_USER.SET_BIO, payload: bio})
    }

    return (
        <OPageContainer
            title="Let them know"
            subtitle="The message is shown to the person approaching you before."
            bottomContainerChildren={
                <OButtonWide
                    text="Done"
                    filled={true}
                    variant="dark"
                    onPress={() => navigation.navigate(ROUTES.MainTabView)}
                />
            }
        >
            <View style={styles.inputContainer}>
                <OTextInput
                    value={state.bio}
                    setValue={setBio}
                    placeholder="No pick-up lines please. Just be chill."
                />
                <View style={styles.characterCountContainer}>
                    <Text style={styles.characterCount}>{MAX_LENGTH_BIO - state.bio.length}</Text>
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    subtitleContainer: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    subtitle: {
        ...Subtitle,
        textAlign: 'right',
    },
    inputContainer: {
        marginBottom: 16,
    },
    characterCountContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    characterCount: {
        ...Subtitle,
    },
});

export default BioLetThemKnow;