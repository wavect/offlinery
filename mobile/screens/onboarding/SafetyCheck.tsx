import { Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { registerUser } from "@/services/auth.service";
import { CommonActions } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const SafetyCheck = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.SafetyCheck
>) => {
    const { state, dispatch } = useUserContext();

    const onCallBooked = async () => {
        navigation.navigate(ROUTES.Onboarding.BookSafetyCall, {
            onCallBooked: async () => {
                const onSuccess = () =>
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: ROUTES.Onboarding.WaitingVerification,
                                },
                            ],
                        }),
                    );
                const onFailure = (err: any) => {
                    console.error(err);
                    Sentry.captureException(err, {
                        tags: {
                            safetyCheck: "onFailure",
                        },
                    });
                };
                await registerUser(state, dispatch, onSuccess, onFailure);
            },
        });
    };
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
                    onPress={onCallBooked}
                />
                <Text style={[Subtitle, styles.subtitle]}>
                    {i18n.t(TR.book15MinCallDescr)}
                </Text>

                <OButtonWide
                    text={i18n.t(TR.iPreferKYC)}
                    filled={false}
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
        marginTop: 20,
        alignItems: "center",
        width: "100%",
    },
});

export default SafetyCheck;
