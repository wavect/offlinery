import { Color, Title } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface IOPagerHeaderProps {
    title: string;
    onHelpPress?: () => void;
    highlightHelpBtn?: boolean;
}

export const OPageHeader = ({
    title,
    onHelpPress,
    highlightHelpBtn,
}: IOPagerHeaderProps) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;
    const colorAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (highlightHelpBtn) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.3,
                        duration: 800,
                        easing: Easing.elastic(1),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();

            const createTiltAnimation = () => {
                return Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: Math.random() > 0.5 ? 0.3 : -0.3,
                        duration: 150,
                        easing: Easing.bounce,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: Math.random() > 0.5 ? -0.25 : 0.25,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]);
            };

            Animated.loop(
                Animated.sequence([
                    createTiltAnimation(),
                    Animated.delay(Math.random() * 1000 + 500),
                ]),
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(colorAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(colorAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ]),
            ).start();
        }
    }, [highlightHelpBtn]);

    const spin = rotateAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-30deg", "30deg"],
    });

    return (
        <View style={styles.container}>
            <Text style={Title}>{title}</Text>
            {onHelpPress && (
                <TouchableOpacity onPress={onHelpPress}>
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }, { rotate: spin }],
                        }}
                    >
                        <MaterialIcons
                            name="help-outline"
                            size={20}
                            style={styles.icon}
                        />
                    </Animated.View>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: "row", marginLeft: 12 },
    icon: { marginLeft: 3, padding: 6, paddingTop: 16, color: Color.primary },
});
