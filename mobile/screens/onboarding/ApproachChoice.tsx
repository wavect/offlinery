import { Color, Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import {
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTOVerificationStatusEnum,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/services/storage.service";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const ApproachChoice = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.ApproachChoice
>) => {
    const { state, dispatch } = useUserContext();

    const setApproachChoice = (
        approachChoice: UserPrivateDTOApproachChoiceEnum,
    ) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { approachChoice },
        });

        switch (approachChoice) {
            case UserPrivateDTOApproachChoiceEnum.approach: // fall through
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        verificationStatus:
                            UserPrivateDTOVerificationStatusEnum.pending,
                    },
                });
                navigation.navigate(ROUTES.HouseRules, {
                    nextPage: ROUTES.Onboarding.SafetyCheck,
                });
                break;
            case UserPrivateDTOApproachChoiceEnum.be_approached:
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        verificationStatus:
                            UserPrivateDTOVerificationStatusEnum.not_needed,
                    },
                });
                navigation.navigate(ROUTES.HouseRules, {
                    nextPage: ROUTES.Onboarding.DontApproachMeHere,
                });
                break;
            case UserPrivateDTOApproachChoiceEnum.both:
                // @dev both flows need to be completed, checked on last screen
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        verificationStatus:
                            UserPrivateDTOVerificationStatusEnum.pending,
                    },
                });
                navigation.navigate(ROUTES.HouseRules, {
                    nextPage: ROUTES.Onboarding.DontApproachMeHere,
                });
        }
    };

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    return (
        <OPageContainer
            bottomContainerChildren={
                <Text style={styles.footnote}>{i18n.t(TR.changePossible)}</Text>
            }
        >
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.approach)}
                    filled={true}
                    variant="dark"
                    size="smaller"
                    onPress={() =>
                        setApproachChoice(
                            UserPrivateDTOApproachChoiceEnum.approach,
                        )
                    }
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.approachDescr)}
                </Text>
            </View>

            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.beApproached)}
                    filled={true}
                    size="smaller"
                    variant="dark"
                    onPress={() =>
                        setApproachChoice(
                            UserPrivateDTOApproachChoiceEnum.be_approached,
                        )
                    }
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.beApproachedDescr)}
                </Text>
            </View>

            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.both)}
                    filled={false}
                    variant="dark"
                    size="smaller"
                    onPress={() =>
                        setApproachChoice(UserPrivateDTOApproachChoiceEnum.both)
                    }
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.bothDescr)}
                </Text>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    optionContainer: {
        alignItems: "center",
        marginTop: 30,
        width: "100%",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
    },
    footnote: {
        textAlign: "center",
        color: Color.lightGray,
        fontSize: 14,
        marginTop: 20,
    },
});

export default ApproachChoice;
