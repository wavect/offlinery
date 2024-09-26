import { Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import {
    SetAcceptedSpecialDataGenderLookingForDTO,
    UserPrivateDTOGenderDesireEnum,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { API } from "@/utils/api-config";
import { GDPR_URL } from "@/utils/general.constants";
import * as React from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const GenderLookingFor = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.GenderLookingFor
>) => {
    const { state, dispatch } = useUserContext();

    const setGender = (gender: UserPrivateDTOGenderDesireEnum) => {
        Alert.alert(
            i18n.t(TR.genderLookingForAlertTitle),
            i18n.t(TR.genderLookingForAlertDescr),
            [
                {
                    text: i18n.t(TR.decline),
                    //onPress: () => onDecline(),
                    style: "cancel",
                },
                {
                    text: i18n.t(TR.dataPrivacy),
                    onPress: () => Linking.openURL(GDPR_URL),
                },
                {
                    text: i18n.t(TR.accept),
                    onPress: async () => {
                        const setAcceptedSpecialDataGenderLookingForDTO: SetAcceptedSpecialDataGenderLookingForDTO =
                            {
                                email: state.email,
                                dateTimeAccepted: new Date(),
                            };
                        await API.registration.pendingUserControllerSetAcceptedSpecialDataGenderLookingForAt(
                            {
                                setAcceptedSpecialDataGenderLookingForDTO,
                            },
                            // TODO: Add RegistrationJWT
                        );

                        dispatch({
                            type: EACTION_USER.UPDATE_MULTIPLE,
                            payload: { genderDesire: gender },
                        });
                        navigation.navigate(ROUTES.Onboarding.AddPhotos);
                    },
                },
            ],
            { cancelable: false },
        );
    };

    return (
        <OPageContainer fullpageIcon="transgender">
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
