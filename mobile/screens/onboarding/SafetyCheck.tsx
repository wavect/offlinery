import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { TR, i18n } from "@/localization/translate.service";
import { SText } from "@/styles/Text.styles";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const SafetyCheck = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.SafetyCheck
>) => {
    return (
        <OPageContainer
            subtitle={i18n.t(TR.safetyCheckDescr)}
            fullpageIcon="safety-check"
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
                <SText.Medium center marginTop={10} marginBottom={30}>
                    {i18n.t(TR.book15MinCallDescr)}
                </SText.Medium>

                <OButtonWide
                    text={i18n.t(TR.iPreferKYC)}
                    filled={false}
                    variant="dark"
                    disabled={true}
                />
                <SText.Medium center marginTop={10}>
                    {i18n.t(TR.iPreferKYCDescr)}
                </SText.Medium>
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
        marginTop: 20,
        alignItems: "center",
        width: "100%",
    },
});

export default SafetyCheck;
