import { Color } from "@/GlobalStyles";
import * as Sentry from "@sentry/react-native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageErrorEventData,
    ImageProps,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from "react-native";

interface OImageWithLoaderProps extends ImageProps {
    fallbackSource?: ImageProps["source"];
}

export const OImageWithLoader = (props: OImageWithLoaderProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleError = useCallback(
        (err: NativeSyntheticEvent<ImageErrorEventData>) => {
            Sentry.captureException(err, {
                tags: {
                    imageWithLoader: "handleError",
                },
            });
        },
        [],
    );

    return (
        <View style={[styles.container, props.style]}>
            <Image
                {...props}
                style={[styles.image, props.style]}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
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
