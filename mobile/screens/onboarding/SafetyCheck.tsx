import { Subtitle } from "@/GlobalStyles";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { TR, i18n } from "@/localization/translate.service";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../routes";

const SafetyCheck = ({ navigation }) => {
    return (
        <OPageContainer
            title={i18n.t(TR.safetyCheck)}
            subtitle={i18n.t(TR.safetyCheckDescr)}
        >
            <View style={styles.centerContainer}>
                <OButtonWide
                    text={i18n.t(TR.book15MinCall)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.BookSafetyCall)
                    }
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.book15MinCallDescr)}
                </Text>

                <OButtonWide
                    text={i18n.t(TR.iPreferKYC)}
                    filled={true}
                    variant="dark"
                    disabled={true}
                    style={{ marginTop: 30 }}
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.iPreferKYCDescr)}
                </Text>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    subtitle: {
        textAlign: "center",
        marginTop: 10,
    },
    centerContainer: {
        marginTop: 40,
        alignItems: "center",
        width: "100%",
    },
});

export default SafetyCheck;
