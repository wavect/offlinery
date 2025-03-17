import { Color } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import OCalendlyInline from "@/components/OCalendlyInline/OCalendlyInline";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, getLocalLanguageID, i18n } from "@/localization/translate.service";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const BookSafetyCall = ({
    route,
}: NativeStackScreenProps<MainStackParamList, "Onboarding_BookSafetyCall">) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);
    const [hasBookedCall, setHasBookedCall] = useState(false);

    const onCallBooked = async () => {
        setLoading(true);

        try {
            route.params?.onCallBooked();
        } catch (error) {
            Sentry.captureException(error, {
                tags: {
                    safetyCall: "onCallBooked",
                },
            });
            throw error;
        } finally {
            setLoading(false);
            /** @dev Delete clear password once logged in */
            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { clearPassword: "" },
            });
        }
    };
    const handleEventScheduled = () => {
        setHasBookedCall(true);
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.retainRightToRejectApplicants)}
            bottomContainerChildren={
                hasBookedCall && (
                    <View style={styles.callBookBtnContainer}>
                        <OButtonWide
                            text={i18n.t(TR.callBookedBtnLbl)}
                            filled={true}
                            disabled={!hasBookedCall}
                            variant="dark"
                            onPress={onCallBooked}
                            isLoading={isLoading}
                            loadingBtnText={i18n.t(TR.registering)}
                        />
                    </View>
                )
            }
        >
            <OCalendlyInline
                url={`https://calendly.com/wavect/safety-call-${getLocalLanguageID()}`}
                pageSettings={{
                    hideLandingPageDetails: true,
                    hideEventTypeDetails: true,
                    primaryColor: Color.primary,
                    hideGdprBanner: true, // @dev Make sure we cover this in our data privacy policy
                }}
                utm={{
                    utmSource: "MobileApp",
                }}
                prefill={{
                    email: state.email,
                    firstName: state.firstName,
                    name: state.firstName,
                }}
                onEventScheduled={handleEventScheduled}
            />
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    callBookBtnContainer: {
        alignItems: "center",
        width: "100%",
    },
});

export default BookSafetyCall;
