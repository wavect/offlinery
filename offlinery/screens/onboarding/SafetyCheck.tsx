import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { Subtitle, Title } from "../../GlobalStyles";
import {ROUTES} from "../routes";

const SafetyCheck = ({navigation}) => {
    return (
        <View style={styles.container}>
            <Text style={[Title, styles.title]}>Safety Check</Text>
            <Text style={Subtitle}>
                This will only work if everyone has a great experience and feels safe at all times.
            </Text>
            <View style={styles.content}>
                <OButtonWide text="Book a 15 Minute call" filled={true} variant="dark" onPress={() => navigation.navigate(ROUTES.Onboarding.BookSafetyCall)}/>
                <Text style={[Subtitle, styles.subtitle]}>
                    This will be a Video call. Making sure you have good intentions using this app.
                </Text>

                <OButtonWide text="I Prefer to KYC" filled={true} variant="dark" disabled={true}/>
                <Text style={[Subtitle, styles.subtitle]}>
                    Alternatively, you can do a regulated 3rd party KYC. You'll be charged the provider's fee since we incur real costs (coming soon).
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 18,
    },
    title: {
        marginBottom: 20,
        paddingLeft: 10,
    },
    content: {
        marginTop: 60,
        flex: 1,
        alignItems: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default SafetyCheck;