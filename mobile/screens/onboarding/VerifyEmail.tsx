import { RegistrationApi } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import * as React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ROUTES } from "../routes";

const VerifyEmail = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [code, setCode] = React.useState<string[]>(new Array(6).fill(""));
    const inputs = React.useRef<TextInput[]>([]);

    const isInvalidCode = () => code.some((digit) => digit === "");

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text.length === 1 && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        if (
            event.nativeEvent.key === "Backspace" &&
            index > 0 &&
            code[index] === ""
        ) {
            inputs.current[index - 1].focus();
        }
    };

    const handleSubmit = async () => {
        const verificationCode = code.join("");

        const regApi = new RegistrationApi();
        await regApi.registrationControllerVerifyEmail({
            verifyEmailDTO: { email: state.email, verificationCode },
        });

        navigation.navigate(ROUTES.Onboarding.Password);
    };

    return (
        <OPageContainer
            title={i18n.t(TR.enterVerificationCode)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.verify)}
                    filled={true}
                    disabled={isInvalidCode()}
                    variant="dark"
                    onPress={handleSubmit}
                />
            }
            subtitle={i18n.t(TR.verificationCodeSent)}
        >
            <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) =>
                            (inputs.current[index] = ref as TextInput)
                        }
                        style={styles.otpInput}
                        maxLength={1}
                        keyboardType="number-pad"
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        value={digit}
                    />
                ))}
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    otpInput: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        textAlign: "center",
        fontSize: 20,
    },
});

export default VerifyEmail;
