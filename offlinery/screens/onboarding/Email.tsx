import * as React from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";
import Checkbox from 'expo-checkbox';
import { useState } from "react";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import {Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";

const Email = ({navigation}) => {
    const [isCheckboxChecked, setCheckboxChecked] = useState(false)
    const [email, setEmail] = useState("")

    const isInvalidEmail = () => !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={Title}>What's your email?</Text>
                <Text style={Subtitle}>
                    Don't lose access to your account, verify your email.
                </Text>

                <View style={styles.inputField}>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.checkboxField}>
                    <Checkbox value={isCheckboxChecked} onValueChange={setCheckboxChecked} />
                    <Text style={styles.checkboxLabel}>
                        I want to receive news, updates and offers from Offlinery.
                    </Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <OButtonWide text="Continue" filled={true} disabled={isInvalidEmail()} variant="dark"
                             onPress={() => navigation.navigate(ROUTES.Onboarding.ApproachChoice)}/>
            </View>
        </View>
    );
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

export default Email;