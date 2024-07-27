import * as React from "react";
import {useState} from "react";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Color} from "../../GlobalStyles";
import {useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import OCalendlyInline from "../../components/OCalendlyInline/OCalendlyInline";

const BookSafetyCall = ({navigation}) => {
    // const [hasBookedCall, setCallBooked] = useState(false)
    const {state} = useUserContext();

    /* later on maybe, but difficult since only page resize event is triggered for some reason

    useCalendlyEventListener({
        onEventScheduled: (e) => setCallBooked(true),
    });*/

    return <OPageContainer title="Book Safety Call"
                           subtitle="We retain our right to reject applicants to ensure everyone feels safe and respected."
                           bottomContainerChildren={<OButtonWide text="Next" filled={true} countdownEnableSeconds={10}
                                                                 variant="dark"/>}>

        <OCalendlyInline url="https://calendly.com/wavect/safety-call" pageSettings={{
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