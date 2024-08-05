import * as React from "react";
import {useState} from "react";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Color} from "../../GlobalStyles";
import {registerUser, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import OCalendlyInline from "../../components/OCalendlyInline/OCalendlyInline";
import {ROUTES} from "../routes";

const BookSafetyCall = ({navigation}) => {
    // const [hasBookedCall, setCallBooked] = useState(false)
    const {state, dispatch} = useUserContext();
    const [isLoading, setLoading] = useState(false)

    /* later on maybe, but difficult since only page resize event is triggered for some reason

    useCalendlyEventListener({
        onEventScheduled: (e) => setCallBooked(true),
    });*/

    const startUserRegistration = async () => {
        setLoading(true)
        const onSuccess = () => navigation.navigate(ROUTES.Onboarding.WaitingVerification)
        const onFailure = (err: any) => console.error(err) // TODO
        try {
            await registerUser(state, dispatch, onSuccess, onFailure)
        } finally {
            setLoading(false)
        }
    }

    return <OPageContainer title="Book Safety Call"
                           subtitle="We retain our right to reject applicants to ensure everyone feels safe and respected."
                           bottomContainerChildren={
        <OButtonWide text="Call booked?" filled={true} countdownEnableSeconds={10}
                     isLoading={isLoading} loadingBtnText='Registering..'
                                                                 variant="dark" onPress={startUserRegistration}/>}>

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