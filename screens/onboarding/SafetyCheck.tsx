import * as React from "react";
import {StyleSheet, Text, View} from "react-native";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";

const SafetyCheck = ({navigation}) => {

    return <OPageContainer title="Safety Check"
                           subtitle="This will only work if everyone has a great experience and feels safe at all times.">
        <View style={styles.centerContainer}>
        <OButtonWide text="Book a 15 Minute call" filled={true} variant="dark"
                     onPress={() => navigation.navigate(ROUTES.Onboarding.BookSafetyCall)}/>
        <Text style={[Subtitle, styles.subtitle]}>
            This will be a Video call. Making sure you have good intentions using this app.
        </Text>

        <OButtonWide text="I Prefer to KYC" filled={true} variant="dark" disabled={true} style={{marginTop: 30}}/>
        <Text style={[Subtitle, styles.subtitle]}>
            Alternatively, you can do a regulated 3rd party KYC. You'll be charged the provider's fee since we incur
            real costs (coming soon).
        </Text>
        </View>
    </OPageContainer>
};

const styles = StyleSheet.create({
    subtitle: {
        textAlign: 'center',
        marginTop: 10,
    },
    centerContainer: {
        marginTop: 40,
        alignItems: 'center',
        width: '100%',
    }
});

export default SafetyCheck;