import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface IOCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onDismiss?: () => void;
    dismissable?: boolean;
    initiallyVisible?: boolean;
}

const OCard = ({
    children,
    style,
    onDismiss,
    dismissable = false,
    initiallyVisible = true,
}: IOCardProps) => {
    const [visible, setVisible] = useState(initiallyVisible);
    const fadeAnim = useState(new Animated.Value(1))[0];

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            onDismiss?.();
        });
    };

    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.card,
                style,
                { opacity: fadeAnim },
                dismissable ? { paddingRight: 30 } : undefined,
            ]}
        >
            {dismissable && (
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <MaterialIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
            )}
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        padding: 16,
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        right: 8,
        top: 8,
        padding: 4,
        zIndex: 1,
    },
});

export default OCard;
