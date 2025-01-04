import { Color } from "@/GlobalStyles";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageProps,
    StyleSheet,
    View,
} from "react-native";

interface OImageWithLoaderProps extends ImageProps {}

export const OImageWithLoader = (props: OImageWithLoaderProps) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View style={[styles.container, props.style]}>
            <Image
                {...props}
                style={[styles.image, props.style]}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
            />
            {isLoading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Color.primary} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    loaderContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
    },
});
