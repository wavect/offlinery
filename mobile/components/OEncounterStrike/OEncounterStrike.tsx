import { OModal } from "@/components/OModal/OModal";
import { TR, i18n } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface OEncounterStrikeProps {
    amountStreaks?: number;
    isNearbyRightNow: boolean;
    testID?: string;
}

export const OEncounterStrike: React.FC<OEncounterStrikeProps> = ({
    amountStreaks,
    isNearbyRightNow,
    testID,
}) => {
    if (!amountStreaks && !isNearbyRightNow) return;

    const [showModal, setShowModal] = useState(false);
    // Animation values
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(0.7)).current;

    // Store animation references to stop them when needed
    const scaleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
    const opacityAnimationRef = useRef<Animated.CompositeAnimation | null>(
        null,
    );

    useEffect(() => {
        if (isNearbyRightNow) {
            // Reset values before starting new animations
            scaleValue.setValue(1);
            opacityValue.setValue(0.7);

            // Create and store animation references
            scaleAnimationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.2,
                        duration: 1000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            );

            opacityAnimationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(opacityValue, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.sin,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityValue, {
                        toValue: 0.7,
                        duration: 800,
                        easing: Easing.sin,
                        useNativeDriver: true,
                    }),
                ]),
            );

            // Start animations
            scaleAnimationRef.current.start();
            opacityAnimationRef.current.start();
        }

        // Cleanup function to stop animations and reset values
        return () => {
            if (scaleAnimationRef.current) {
                scaleAnimationRef.current.stop();
                scaleValue.setValue(1);
            }
            if (opacityAnimationRef.current) {
                opacityAnimationRef.current.stop();
                opacityValue.setValue(0.7);
            }
        };
    }, [isNearbyRightNow]);

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={() => setShowModal(true)}
                testID={testID}
            >
                <View style={styles.strikeContainer}>
                    <Animated.View
                        style={[
                            styles.iconContainer,
                            {
                                transform: [{ scale: scaleValue }],
                                opacity: opacityValue,
                            },
                        ]}
                    >
                        <MaterialIcons
                            name="local-fire-department"
                            size={30}
                            color="#ff6b00"
                            fill="#ff9500"
                            strokeWidth={1.5}
                        />
                        <Text
                            style={[
                                styles.strikeLbl,
                                isNearbyRightNow
                                    ? { bottom: -25 }
                                    : { bottom: -10 },
                            ]}
                        >
                            {isNearbyRightNow
                                ? i18n.t(TR.isNearby)
                                : amountStreaks}
                        </Text>
                    </Animated.View>
                </View>
            </TouchableOpacity>
            <OModal
                showModal={showModal}
                setShowModal={setShowModal}
                text={i18n.t(
                    isNearbyRightNow
                        ? TR.strikeNearbyRightNowExplanation
                        : TR.strikeExplanation,
                )}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    strikeContainer: {
        position: "relative",
        marginHorizontal: 5,
    },
    iconContainer: {
        alignItems: "center",
    },
    strikeLbl: {
        position: "absolute",
        textAlign: "center",
        bottom: -10,
        fontSize: 10,
        color: "#ff6b00",
        fontWeight: "bold",
    },
});
