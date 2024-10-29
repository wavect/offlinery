import { BorderRadius, Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserPrivateDTOApproachChoiceEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { TestData } from "@/tests/src/accessors";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

type Rule = { title: string; description: string };

const getRules = (approachChoice: UserPrivateDTOApproachChoiceEnum): Rule[] => {
    const houseRules: Rule[] = [
        {
            title: TR.houseRules.titleRespectful,
            description: TR.houseRules.descrRespectful,
        },
        {
            title: TR.houseRules.titleAuthentic,
            description: TR.houseRules.descrAuthentic,
        },
    ];

    switch (approachChoice) {
        case UserPrivateDTOApproachChoiceEnum.be_approached:
            return [
                ...houseRules,
                {
                    title: TR.specificHouseRulesBeApproached.titleEmpathy,
                    description: TR.specificHouseRulesBeApproached.descrEmpathy,
                },
                {
                    title: TR.specificHouseRulesBeApproached.titleHonest,
                    description: TR.specificHouseRulesBeApproached.descrHonest,
                },
                {
                    title: TR.specificHouseRulesBeApproached.titleGoodTime,
                    description:
                        TR.specificHouseRulesBeApproached.descrGoodTime,
                },
            ];
            break;
        case UserPrivateDTOApproachChoiceEnum.approach:
        case UserPrivateDTOApproachChoiceEnum.both:
        default:
            return [
                ...houseRules,
                {
                    title: TR.houseRules.titleAcceptNo,
                    description: TR.houseRules.descrAcceptNo,
                },
                {
                    title: TR.houseRules.titleWaitWeird,
                    description: TR.houseRules.descrWaitWeird,
                },
                {
                    title: TR.houseRules.titleDontRush,
                    description: TR.houseRules.descrDontRush,
                },
            ];
    }
};

const HouseRules = ({
    route,
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.HouseRules>) => {
    const { state } = useUserContext();
    const forceWaitSeconds = route.params?.forceWaitSeconds ?? 5;

    const rules: Rule[] = getRules(state.approachChoice);

    return (
        <OPageColorContainer>
            {rules.map((r) => {
                return (
                    <RuleItem
                        key={r.title}
                        title={i18n.t(r.title)}
                        description={i18n.t(r.description)}
                    />
                );
            })}

            <View style={styles.buttonContainer}>
                <OButtonWide
                    testID={TestData.settings.houseRules.buttonUnderstand}
                    text={i18n.t(TR.iUnderstand)}
                    filled={true}
                    variant="light"
                    countdownEnableSeconds={forceWaitSeconds}
                    onPress={() =>
                        navigation.navigate(
                            route.params.nextPage,
                            route.params.propsForNextScreen,
                        )
                    }
                />

                <Text style={styles.violatingRules}>
                    {i18n.t(TR.violatingRules.p1)}
                    <Text style={styles.boldText}>
                        {i18n.t(TR.violatingRules.duration)}
                    </Text>
                    {i18n.t(TR.violatingRules.p2)}
                </Text>
            </View>
        </OPageColorContainer>
    );
};

interface IRuleItemProps {
    title: string;
    description: string;
}

const RuleItem: React.FC<IRuleItemProps> = ({ title, description }) => (
    <View style={styles.ruleItem}>
        <MaterialIcons
            name="check"
            size={24}
            color={Color.white}
            style={styles.checkIcon}
        />
        <View style={styles.ruleTextContainer}>
            <Text style={styles.ruleTitle}>{title}</Text>
            <Text style={styles.ruleDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        marginTop: 100,
    },
    ruleItem: {
        flexDirection: "row",
        marginBottom: 25,
    },
    checkIcon: {
        marginRight: 13,
    },
    ruleTextContainer: {
        flex: 1,
    },
    ruleTitle: {
        fontFamily: FontFamily.montserratRegular,
        fontWeight: "600",
        fontSize: FontSize.size_xl,
        color: Color.white,
        marginBottom: 5,
    },
    ruleDescription: {
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_sm,
        color: Color.white,
    },
    violatingRules: {
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_sm,
        color: Color.white,
        textAlign: "center",
        marginVertical: 20,
    },
    boldText: {
        fontFamily: FontFamily.montserratRegular,
        fontWeight: "600",
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    button: {
        backgroundColor: Color.white,
        borderRadius: BorderRadius.br_81xl,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#36797d",
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratRegular,
        fontWeight: "500",
    },
});

export default HouseRules;
