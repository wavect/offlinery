import { Color } from "@/GlobalStyles";
import React, { memo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

interface SpinnerProps {
    size?: number;
    color?: string;
    text?: string;
    duration?: number;
    textStyle?: TextStyle;
    containerStyle?: ViewStyle;
    spinnerStyle?: ViewStyle;
    isVisible?: boolean;
}

interface SpinnerStyles {
    loadingText: TextStyle;
    container: ViewStyle;
    spinner: ViewStyle;
}

const DEFAULT_SIZE = 40;

export const OLoadingSpinnerComponent: React.FC<SpinnerProps> = ({
    size = DEFAULT_SIZE,
    color = Color.primary,
    text,
    textStyle,
    containerStyle,
    spinnerStyle,
    isVisible = true,
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <View style={[styles.container, containerStyle]}>
            <ActivityIndicator
                style={[
                    styles.spinner,
                    {
                        width: size,
                        height: size,
                        borderTopColor: color,
                    },
                    spinnerStyle,
                ]}
            />
            {text && (
                <Text
                    style={[styles.loadingText, textStyle]}
                    accessibilityRole="alert"
                    accessibilityLabel={text}
                >
                    {text}
                </Text>
            )}
        </View>
    );
};

export const OLoadingSpinner = memo(OLoadingSpinnerComponent);

const styles = StyleSheet.create<SpinnerStyles>({
    loadingText: {
        marginTop: 30,
        fontSize: 16,
        textAlign: "center",
        color: "#666",
    },
    container: {
        height: "100%",
        minHeight: "50%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    spinner: {
        borderRightColor: "#00000001",
        borderLeftColor: "#00000001",
        borderBottomColor: "#00000001",
    },
});
