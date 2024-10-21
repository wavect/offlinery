import { ErrorMessage } from "@/GlobalStyles";
import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";

interface OErrorMessageProps {
    errorMessage: string;
    style?: StyleProp<TextStyle>;
}

const OErrorMessage: React.FC<OErrorMessageProps> = ({
    errorMessage,
    style,
}) => {
    return <Text style={[ErrorMessage, style]}>{errorMessage}</Text>;
};

export default OErrorMessage;
