import * as React from "react";
import {useState} from "react";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Color} from "../../GlobalStyles";
import {InlineWidget, useCalendlyEventListener} from "react-calendly";
import {useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";

const BookSafetyCall = ({navigation}) => {
    const [hasBookedCall, setCallBooked] = useState(false)
    const {state} = useUserContext();

    useCalendlyEventListener({
        onEventScheduled: (e) => setCallBooked(true),
    });

    return <OPageContainer title="Book Safety Call"
                           subtitle="We retain our right to reject applicants to ensure everyone feels safe and respected."
                           bottomContainerChildren={<OButtonWide text="Next" filled={true} disabled={!hasBookedCall}
                                                                 variant="dark"/>}>
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
        }}/>
    </OPageContainer>
};

export default BookSafetyCall;