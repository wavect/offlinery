import * as React from "react";
import {Text, StyleSheet, View, Image, ScrollView, ImageSourcePropType} from "react-native";
import { Color, FontSize, FontFamily, BorderRadius } from "../GlobalStyles";
import { OShowcase } from "../components/OShowcase/OShowcase";
import { OLinearBackground } from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {useEffect, useState} from "react";
import {MaterialIcons} from "@expo/vector-icons";

const HouseRules = ({ route, navigation }) => {

    return (
        <OLinearBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <OShowcase subtitle="Stop Swiping. Meet IRL." />
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

                <View style={styles.buttonContainer}>
                    <OButtonWide text="I understand" filled={true} variant="light"
                                 countdownEnableSeconds={5} onPress={() => navigation.navigate(route.params.nextPage)}/>

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
        <MaterialIcons name="check" size={24} color={Color.white} style={styles.checkIcon}/>
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
        flexDirection: 'row',
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