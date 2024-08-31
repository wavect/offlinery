import { Color, Subtitle } from "@/GlobalStyles";
import {
    UserApproachChoiceEnum,
    UserVerificationStatusEnum,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../routes";

const ApproachChoice = ({ navigation }) => {
    const { dispatch } = useUserContext();

    const setApproachChoice = (approachChoice: UserApproachChoiceEnum) => {
        dispatch({
            type: EACTION_USER.SET_APPROACH_CHOICE,
            payload: approachChoice,
        });

        switch (approachChoice) {
            case UserApproachChoiceEnum.approach: // fall through
                dispatch({
                    type: EACTION_USER.SET_VERIFICATION_STATUS,
                    payload: UserVerificationStatusEnum.pending,
                });
                navigation.navigate(ROUTES.Onboarding.SafetyCheck);
                break;
            case UserApproachChoiceEnum.be_approached:
                dispatch({
                    type: EACTION_USER.SET_VERIFICATION_STATUS,
                    payload: UserVerificationStatusEnum.not_needed,
                });
                navigation.navigate(ROUTES.Onboarding.DontApproachMeHere); // not doing IliveHere for now, to avoid geoFencing their address
                break;
            case UserApproachChoiceEnum.both:
            // TODO: Not yet supported, since both flows need to be completed
        }
    };

    return (
        <OPageContainer
            title={i18n.t(TR.iWantTo)}
            bottomContainerChildren={
                <Text style={styles.footnote}>
                    No worries, you can change this at any time.
                </Text>
            }
        >
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.approach)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        setApproachChoice(UserApproachChoiceEnum.approach)
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
                    variant="dark"
                    onPress={() =>
                        setApproachChoice(UserApproachChoiceEnum.be_approached)
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
                    disabled={true}
                    onPress={() =>
                        setApproachChoice(UserApproachChoiceEnum.both)
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
        marginTop: 40,
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
