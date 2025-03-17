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
import { saveOnboardingState } from "@/services/storage.service";
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
    const [selectedGenders, setSelectedGenders] = React.useState<
        UserPrivateDTOGenderDesireEnum[]
    >([]);

    const toggleGender = (gender: UserPrivateDTOGenderDesireEnum) => {
        setSelectedGenders((prev) =>
            prev.includes(gender)
                ? prev.filter((g) => g !== gender)
                : [...prev, gender],
        );
    };

    const isSelected = (gender: UserPrivateDTOGenderDesireEnum) =>
        selectedGenders.includes(gender);

    const handleSubmit = () => {
        Alert.alert(
            i18n.t(TR.genderLookingForAlertTitle),
            i18n.t(TR.genderLookingForAlertDescr),
            [
                {
                    text: i18n.t(TR.decline),
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
                        await API.pendingUser.pendingUserControllerSetAcceptedSpecialDataGenderLookingForAt(
                            {
                                setAcceptedSpecialDataGenderLookingForDTO,
                            },
                        );
                        dispatch({
                            type: EACTION_USER.UPDATE_MULTIPLE,
                            payload: { genderDesire: selectedGenders },
                        });
                        navigation.navigate(ROUTES.Onboarding.AddPhotos);
                    },
                },
            ],
            { cancelable: false },
        );
    };

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    return (
        <OPageContainer
            fullpageIcon="transgender"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    onPress={handleSubmit}
                    variant={"dark"}
                    disabled={selectedGenders.length === 0}
                />
            }
        >
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.women)}
                    filled={isSelected(UserPrivateDTOGenderDesireEnum.woman)}
                    variant="dark"
                    onPress={() => toggleGender("woman")}
                />
            </View>
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.men)}
                    filled={isSelected(UserPrivateDTOGenderDesireEnum.man)}
                    variant="dark"
                    onPress={() => toggleGender("man")}
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

export default GenderLookingFor;
