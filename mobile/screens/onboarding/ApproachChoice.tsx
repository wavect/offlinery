import { Color, Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import {
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTOVerificationStatusEnum,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTooltip } from "@/components/OTooltip/OTooltip";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/services/storage.service";
import * as React from "react";
import { useMemo } from "react";
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
            payload: {
                approachChoice,
                verificationStatus:
                    UserPrivateDTOVerificationStatusEnum.pending,
            },
        });

        switch (approachChoice) {
            case UserPrivateDTOApproachChoiceEnum.approach: // fall through
                navigation.navigate(ROUTES.HouseRules, {
                    navigation,
                    nextPage: ROUTES.Onboarding.SafetyCheck,
                });
                break;
            case UserPrivateDTOApproachChoiceEnum.be_approached:
                navigation.navigate(ROUTES.HouseRules, {
                    navigation,
                    nextPage: ROUTES.Onboarding.DontApproachMeHere,
                });
                break;
            case UserPrivateDTOApproachChoiceEnum.both:
                navigation.navigate(ROUTES.HouseRules, {
                    navigation,
                    nextPage: ROUTES.Onboarding.DontApproachMeHere,
                });
        }
    };

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    const ScreeningRequired = useMemo(
        () => (
            <OTooltip
                style={styles.toolTip}
                tooltipText={i18n.t(TR.emotionalIntelligenceScreeningRequired)}
                iconName="help-outline"
                iconColor={Color.primary}
            />
        ),
        [],
    );

    return (
        <OPageContainer
            bottomContainerChildren={
                <Text style={styles.footnote}>{i18n.t(TR.changePossible)}</Text>
            }
        >
            <View style={styles.optionContainer}>
                <View style={styles.helpBtnContainer}>
                    <OButtonWide
                        text={i18n.t(TR.approach)}
                        filled={true}
                        style={styles.buttonWithToolTip}
                        variant="dark"
                        size="smaller"
                        onPress={() =>
                            setApproachChoice(
                                UserPrivateDTOApproachChoiceEnum.approach,
                            )
                        }
                    />
                    {ScreeningRequired}
                </View>
                <View style={styles.subtitleContainer}>
                    <Text style={[Subtitle, styles.subtitle]}>
                        {i18n.t(TR.approachDescr)}
                    </Text>
                </View>
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
                <View style={styles.helpBtnContainer}>
                    <OButtonWide
                        text={i18n.t(TR.both)}
                        style={styles.buttonWithToolTip}
                        filled={false}
                        variant="dark"
                        size="smaller"
                        onPress={() =>
                            setApproachChoice(
                                UserPrivateDTOApproachChoiceEnum.both,
                            )
                        }
                    />
                    {ScreeningRequired}
                </View>
                <View style={styles.subtitleContainer}>
                    <Text style={[Subtitle, styles.subtitle]}>
                        {i18n.t(TR.bothDescr)}
                    </Text>
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    toolTip: {
        marginLeft: 10,
    },
    buttonWithToolTip: {
        width: "80%",
    },
    helpBtnContainer: {
        flex: 1,
        flexDirection: "row",
    },
    optionContainer: {
        alignItems: "center",
        marginTop: 30,
        width: "100%",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    footnote: {
        textAlign: "center",
        color: Color.lightGray,
        fontSize: 14,
        marginTop: 20,
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ApproachChoice;
