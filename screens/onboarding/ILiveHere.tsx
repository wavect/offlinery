import * as React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";

const ILiveHere = ({navigation}) => {
    const {state, dispatch} = useUserContext()

    const isInvalidLocation = () => {
        return true; // TODO
    }

    return <OPageContainer title="I live here"
                           bottomContainerChildren={<OButtonWide text="Continue" filled={true}
                                                                 disabled={isInvalidLocation()} variant="dark"/>}
                           subtitle={<>
                               <Text>This is </Text>
                               <Text style={{fontWeight: "bold"}}>not</Text>
                               <Text> public. This is used to not inform others you are nearby when you are at home.</Text></>
                           }>


        <>{/* TODO */}</>
    </OPageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 18,
    },
    content: {
        flex: 1,
    },
    inputField: {
        marginBottom: 24,
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