import { BorderRadius, Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const HouseRules = ({
    route,
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.HouseRules>) => {
    const forceWaitSeconds = route.params?.forceWaitSeconds ?? 5;

    return (
        <OPageColorContainer>
            <RuleItem
                title={i18n.t(TR.houseRules.titleRespectful)}
                description={i18n.t(TR.houseRules.descrRespectful)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleAcceptNo)}
                description={i18n.t(TR.houseRules.descrAcceptNo)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleAuthentic)}
                description={i18n.t(TR.houseRules.descrAuthentic)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleWaitWeird)}
                description={i18n.t(TR.houseRules.descrWaitWeird)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleDontRush)}
                description={i18n.t(TR.houseRules.descrDontRush)}
            />

            <View style={styles.buttonContainer}>
                <OButtonWide
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
