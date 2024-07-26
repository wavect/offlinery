import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import {Color, Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";

const ApproachChoice = ({navigation}) => {
    return (
        <View style={styles.container}>
            <Text style={Title}>I want to</Text>
            <View style={styles.content}>
                <View style={styles.optionContainer}>
                    <OButtonWide text="Approach" filled={true} variant="dark" onPress={() => navigation.navigate(ROUTES.Onboarding.SafetyCheck)} />
                    <Text style={[Subtitle, styles.subtitle]}>
                        Approach people you are interested in. Meet them in-real-life where they are.
                    </Text>
                </View>

                <View style={styles.optionContainer}>
                    <OButtonWide text="Be approached" filled={true} variant="dark" />
                    <Text style={[Subtitle, styles.subtitle]}>
                        Be approached by people you are interested in. Safely and Respectfully.
                    </Text>
                </View>

                <View style={styles.optionContainer}>
                    <OButtonWide text="Both" filled={false} variant="dark" onPress={() => navigation.navigate(ROUTES.Onboarding.SafetyCheck)} />
                    <Text style={[Subtitle, styles.subtitle]}>
                        Want to approach and be approached by people you like?
                    </Text>
                </View>
            </View>
            <Text style={styles.footnote}>
                No worries, you can change this at any time.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white,
        padding: 18,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContainer: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
    footnote: {
        textAlign: 'center',
        color: Color.lightGray,
        fontSize: 14,
        marginTop: 20,
    },
});

export default ApproachChoice;