import * as React from "react";
import {Platform, StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import MapView, {Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE} from "react-native-maps";
import {BorderRadius} from "../../GlobalStyles";
import {OTextInput} from "../../components/OTextInput/OTextInput";

const ILiveHere = ({navigation}) => {
    const {state, dispatch} = useUserContext()

    const setStreet = (street: string) => {
        dispatch({type: EACTION_USER.SET_STREET, payload: street})
    }
    const setPostalCode = (plz: string) => {
        dispatch({type: EACTION_USER.SET_POSTAL_CODE, payload: plz})
    }
    const setCountry = (country: string) => {
        dispatch({type: EACTION_USER.SET_COUNTRY, payload: country})
    }

    const isInvalidLocation = () => {
        return true; // TODO
    }

    return <OPageContainer title="I live here"
                           bottomContainerChildren={<OButtonWide text="Continue" filled={true}
                                                                 disabled={isInvalidLocation()} variant="dark"/>}
                           subtitle={<>
                               <Text>This is </Text>
                               <Text style={{fontWeight: "bold"}}>not</Text>
                               <Text> public. This is used to not inform others you are nearby when you are at
                                   home.</Text></>
                           }>


        <>

            <OTextInput value={state.street} setValue={setStreet} placeholder="Street" style={styles.inputField}/>
            <OTextInput value={state.postalCode} setValue={setPostalCode} placeholder="Postal code" style={styles.inputField}/>
            <OTextInput value={state.country} setValue={setCountry} placeholder="Country" style={styles.inputField}/>

            {/* recently google maps not supported on ios anymore: https://github.com/react-native-maps/react-native-maps/issues/5049 at least partially */}
            <MapView style={styles.map}
                     initialRegion={{
                         latitude: 47.257832302,
                         longitude: 11.383665132,
                         latitudeDelta: 0.0922,
                         longitudeDelta: 0.0421,
                     }}
                     provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}>
            </MapView>
        </>
    </OPageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 18,
    },
    map: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.br_5xs,
    },
    content: {
        flex: 1,
    },
    inputField: {
        marginBottom: 10,
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

export default ILiveHere;