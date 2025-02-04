import { OLoadingSpinner } from "@/components/OLoadingCircle/OLoadingCircle";
import { ImageLoadError } from "@/utils/svg-inline.registry";
import * as Sentry from "@sentry/react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Image,
    ImageErrorEventData,
    ImageProps,
    ImageURISource,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    View,
} from "react-native";

interface OImageWithLoaderProps extends ImageProps {
    showLoadingIndicator?: boolean;
    source?: ImageURISource;
}

export const OImageWithLoader = (props: OImageWithLoaderProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleError = useCallback(
        (err: NativeSyntheticEvent<ImageErrorEventData>) => {
            Sentry.captureException(err.nativeEvent, {
                tags: {
                    imageWithLoader: "handleError",
                },
            });
            setIsLoading(false);
            setHasError(true);
        },
        [],
    );

    // Pre-load the image on iOS
    useEffect(() => {
        if (
            Platform.OS === "ios" &&
            typeof props.source === "object" &&
            props.source?.uri
        ) {
            const prefetchResult = Image.prefetch(props.source.uri);
            if (prefetchResult && typeof prefetchResult.catch === "function") {
                prefetchResult.catch(() => {
                    setIsLoading(false);
                    setHasError(true);
                });
            }
        }
    }, [props.source]);

    return (
        <View style={[styles.container, props.style]}>
            {hasError ? (
                <ImageLoadError />
            ) : (
                <Image
                    {...props}
                    style={[styles.image, props.style]}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                />
            )}
            {isLoading && (
                <View style={styles.loaderContainer}>
                    <OLoadingSpinner />
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
