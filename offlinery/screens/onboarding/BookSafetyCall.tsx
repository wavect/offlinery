import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import {Color, Subtitle, Title} from "../../GlobalStyles";
import {InlineWidget, useCalendlyEventListener} from "react-calendly";
import {useUserContext} from "../../context/UserContext";

const BookSafetyCall = ({navigation}) => {
    const [hasBookedCall, setCallBooked] = useState(false)
    const { state } = useUserContext();

    useCalendlyEventListener({
        onEventScheduled: (e) => setCallBooked(true),
    });

    /*prefill email + name, hide details etc
    */

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={Title}>Book Safety Call</Text>
                <Text style={Subtitle}>
                    We retain our right to reject applicants to ensure everyone feels safe and respected.
                </Text>

                <InlineWidget url="https://calendly.com/wavect/safety-call" pageSettings={{
                    hideLandingPageDetails: true,
                    hideEventTypeDetails: true,
                    primaryColor: Color.primary,
                }} utm={{
                    utmSource: 'MobileApp'
                }} prefill={{
                    email: state.email,
                    firstName: state.firstName,
                    name: state.firstName
                }} />

            </View>

            <View style={styles.buttonContainer}>
                <OButtonWide text="Next" filled={true} disabled={!hasBookedCall} variant="dark"/>
                {/*onPress={() => navigation.navigate(ROUTES.Onboarding.ApproachChoice)}/>*/}
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
    content: {
        flex: 1,
    },
    inputField: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    checkboxField: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 10,
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default BookSafetyCall;