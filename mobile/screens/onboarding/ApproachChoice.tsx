import { Color, Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
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
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const ApproachChoice = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.ApproachChoice
>) => {
    const { dispatch } = useUserContext();

    const setApproachChoice = (approachChoice: UserApproachChoiceEnum) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { approachChoice },
        });

        switch (approachChoice) {
            case UserApproachChoiceEnum.approach: // fall through
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        verificationStatus: UserVerificationStatusEnum.pending,
                    },
                });
                navigation.navigate(ROUTES.Onboarding.SafetyCheck);
                break;
            case UserApproachChoiceEnum.be_approached:
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        verificationStatus:
                            UserVerificationStatusEnum.not_needed,
                    },
                });
                navigation.navigate(ROUTES.Onboarding.DontApproachMeHere); // not doing IliveHere for now, to avoid geoFencing their address
                break;
            case UserApproachChoiceEnum.both:
            // TODO: Not yet supported, since both flows need to be completed
        }
    };

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
                    size="smaller"
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
                    size="smaller"
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
