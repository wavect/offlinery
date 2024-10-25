import { Color } from "@/GlobalStyles";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const OProgressBar = () => {
    const [animation] = useState(new Animated.Value(0));
    const screenWidth = Dimensions.get("window").width;

    useEffect(() => {
        const startAnimation = () => {
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: screenWidth,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: -150,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                startAnimation();
            });
        };

        animation.setValue(-150);
        startAnimation();

        return () => {
            animation.stopAnimation();
        };
    }, [screenWidth]);

    return (
        <View style={styles.container}>
            <View style={styles.backgroundBar}>
                <Animated.View
                    style={[
                        styles.loadingBar,
                        {
                            transform: [{ translateX: animation }],
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 10,
    },
    backgroundBar: {
        width: "100%",
        height: 3,
        backgroundColor: Color.lightGray || "#E5E7EB",
        borderRadius: 1.5,
        overflow: "hidden",
    },
    loadingBar: {
        position: "absolute",
        width: 150,
        height: "100%",
        backgroundColor: Color.primary,
        borderRadius: 1.5,
    },
});

export default OProgressBar;
