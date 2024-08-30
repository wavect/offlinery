import * as React from "react";
import { useState } from "react";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import OCalendlyInline from "../../components/OCalendlyInline/OCalendlyInline";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import {
    EACTION_USER,
    registerUser,
    useUserContext,
} from "../../context/UserContext";
import { Color } from "../../GlobalStyles";
import { i18n, TR } from "../../localization/translate.service";
import { ROUTES } from "../routes";

const BookSafetyCall = ({ navigation }) => {
    // const [hasBookedCall, setCallBooked] = useState(false)
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);

    /* later on maybe, but difficult since only page resize event is triggered for some reason

    useCalendlyEventListener({
        onEventScheduled: (e) => setCallBooked(true),
    });*/

    const startUserRegistration = async () => {
        setLoading(true);
        const onSuccess = () =>
            navigation.navigate(ROUTES.Onboarding.WaitingVerification);
        const onFailure = (err: any) => console.error(err); // TODO
        try {
            await registerUser(state, dispatch, onSuccess, onFailure);
        } finally {
            setLoading(false);
            /** @dev Delete clear password once logged in */
            dispatch({ type: EACTION_USER.SET_CLEAR_PASSWORD, payload: "" });
        }
    };

    return (
        <OPageContainer
            title={i18n.t(TR.bookSafetyCall)}
            subtitle={i18n.t(TR.retainRightToRejectApplicants)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.callBookedQuestion)}
                    filled={true}
                    countdownEnableSeconds={10}
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.registering)}
                    variant="dark"
                    onPress={startUserRegistration}
                />
            }
        >
            <OCalendlyInline
                url="https://calendly.com/wavect/safety-call"
                pageSettings={{
                    hideLandingPageDetails: true,
                    hideEventTypeDetails: true,
                    primaryColor: Color.primary,
                }}
                utm={{
                    utmSource: "MobileApp",
                }}
                prefill={{
                    email: state.email,
                    firstName: state.firstName,
                    name: state.firstName,
                }}
            />
        </OPageContainer>
    );
};

export default BookSafetyCall;
