import { Color } from "@/GlobalStyles";
import React, { useCallback, useEffect } from "react";
import {
    Animated,
    Easing,
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

const DEFAULT_DURATION = 1000;
const DEFAULT_SIZE = 40;

export const OLoadingSpinner: React.FC<SpinnerProps> = ({
    size = DEFAULT_SIZE,
    color = Color.primary,
    text,
    duration = DEFAULT_DURATION,
    textStyle,
    containerStyle,
    spinnerStyle,
    isVisible = true,
}) => {
    // Initialize animation value
    const spinValue = React.useRef(new Animated.Value(0)).current;

    // Calculate border width and radius based on size
    const borderWidth = Math.max(2, Math.floor(size * 0.1)); // 10% of size, minimum 2
    const borderRadius = size / 2; // Half of size to create perfect circle

    // Animation setup
    const startSpinning = useCallback(() => {
        spinValue.setValue(0);
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();
    }, [spinValue, duration]);

    useEffect(() => {
        if (isVisible) {
            startSpinning();
        }
        return () => {
            spinValue.stopAnimation();
        };
    }, [isVisible, startSpinning, spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    if (!isVisible) {
        return null;
    }

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View
                style={[
                    styles.spinner,
                    {
                        width: size,
                        height: size,
                        borderWidth,
                        borderRadius,
                        borderTopColor: color,
                        transform: [{ rotate: spin }],
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
