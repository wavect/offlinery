import * as React from "react";
import {Text, StyleSheet, View, Image, ScrollView, ImageSourcePropType} from "react-native";
import { Color, FontSize, FontFamily, Padding, BorderRadius } from "../GlobalStyles";
import { OShowcase } from "../components/OShowcase/OShowcase";
import { OLinearBackground } from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {useEffect, useState} from "react";

const HouseRules = ({ route, navigation }) => {
    const [countdown, setCountdown] = useState(5);
    const [isBtnDisabled, setIsBtnDisabled] = useState(true);
    const {nextPage} = route.params;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer);
                    setIsBtnDisabled(false);
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const buttonText = isBtnDisabled
        ? `I understand (${countdown})`
        : "I understand";

    return (
        <OLinearBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <OShowcase subtitle="Stop Swiping. Meet IRL." />

                <View style={styles.rulesContainer}>
                    <RuleItem
                        title="Be Respectful."
                        description="We've a 0 tolerance for disrespectful behavior."
                    />
                    <RuleItem
                        title="Accept a No."
                        description="Don't be pushy. If there is no vibe, accept it."
                    />
                    <RuleItem
                        title="Be authentic."
                        description="Be yourself. Trust us, it works."
                    />
                    <RuleItem
                        title="Don't wait. Don't make it weird."
                        description="Approach immediately. Don't observe and watch. Just be casual and polite."
                    />
                    <RuleItem
                        title="Don't rush it."
                        description="Don't try to 'close'. Have a good time, the rest follows naturally."
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <OButtonWide text={buttonText} filled={true} variant="light"
                                 disabled={isBtnDisabled} onPress={() => navigation.navigate(nextPage)}/>

                    <Text style={styles.violatingRules}>
                        Violating these rules blocks you from using this app for at least{" "}
                        <Text style={styles.boldText}>12 months</Text>. We have no mercy.
                    </Text>
                </View>
            </ScrollView>
        </OLinearBackground>
    );
};

interface IRuleItemProps {
    title: string
    description: string
}

const RuleItem: React.FC<IRuleItemProps> = ({ title, description }) => (
    <View style={styles.ruleItem}>
        <Image
            style={styles.checkIcon}
            resizeMode="cover"
            source={require("../assets/img/check.svg") as ImageSourcePropType}
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
        marginTop: 50,
    },
    rulesContainer: {
        marginTop: 20,
    },
    ruleItem: {
        flexDirection: 'row',
        marginBottom: 40,
    },
    checkIcon: {
        width: 31,
        height: 31,
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
        textAlign: 'center',
        marginVertical: 20,
    },
    boldText: {
        fontFamily: FontFamily.montserratRegular,
        fontWeight: "600",
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: Color.white,
        borderRadius: BorderRadius.br_81xl,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: "#36797d",
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratRegular,
        fontWeight: "500",
    },
});

export default HouseRules;