import { ErrorMessage } from "@/GlobalStyles";
import React from "react";
import { Text, TextStyle } from "react-native";

interface OErrorMessageProps {
    errorMessage: string;
    style?: TextStyle;
}

const OErrorMessage: React.FC<OErrorMessageProps> = ({
    errorMessage,
    style,
}) => {
    return <Text style={[ErrorMessage, style]}>{errorMessage}</Text>;
};

export default OErrorMessage;
