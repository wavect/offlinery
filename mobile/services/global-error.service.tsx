import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useEffect, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ErrorBoundary, { ErrorBoundaryProps } from "react-native-error-boundary";

interface ErrorNotificationProps {
    error: Error;
    onDismiss: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    error,
    onDismiss,
}) => {
    const [progressAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(progressAnimation, {
            toValue: 100,
            duration: 5000,
            useNativeDriver: false,
        }).start();

        const timer = setTimeout(() => {
            onDismiss();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onDismiss, progressAnimation]);

    return (
        <View style={styles.errorContainer}>
            <View style={styles.errorContent}>
                <Ionicons
                    name="warning"
                    size={24}
                    color="white"
                    style={styles.icon}
                />
                <Text style={styles.errorText}>
                    {error.message || "An error occurred"}
                </Text>
                <TouchableOpacity
                    onPress={onDismiss}
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <Animated.View
                style={[
                    styles.progressBar,
                    {
                        width: progressAnimation.interpolate({
                            inputRange: [0, 100],
                            outputRange: ["0%", "100%"],
                        }),
                    },
                ]}
            />
        </View>
    );
};

interface GlobalErrorHandlerProps {
    children: ReactNode;
}

const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({
    children,
}) => {
    const [error, setError] = useState<Error | null>(null);

    const handleError: ErrorBoundaryProps["onError"] = (error, stackTrace) => {
        console.log("Error detection on!");
        console.error("Caught an error:", error, stackTrace);
        setError(error);
    };

    const dismissError = () => {
        setError(null);
    };

    useEffect(() => {
        const originalErrorHandler = ErrorUtils.getGlobalHandler();

        ErrorUtils.setGlobalHandler((error, isFatal) => {
            console.error("Global error caught:", error, isFatal);
            handleError(error, error.stack);
        });

        return () => {
            ErrorUtils.setGlobalHandler(originalErrorHandler);
        };
    }, []);

    const fallbackComponent = ({
        error,
        resetError,
    }: {
        error: Error;
        resetError: () => void;
    }) => {
        return (
            <View style={styles.fallbackContainer}>
                {children}
                <ErrorNotification
                    error={error}
                    onDismiss={() => {
                        dismissError();
                        resetError();
                    }}
                />
            </View>
        );
    };

    return (
        <ErrorBoundary
            onError={handleError}
            FallbackComponent={fallbackComponent}
        >
            <View style={styles.container}>
                {children}
                {error && (
                    <ErrorNotification error={error} onDismiss={dismissError} />
                )}
            </View>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fallbackContainer: {
        flex: 1,
    },
    errorContainer: {
        position: "absolute",
        top: 55,
        left: 20,
        right: 20,
        backgroundColor: "rgba(220, 53, 69, 0.95)", // Bootstrap's danger color
        borderRadius: 8,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    errorContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    icon: {
        marginRight: 10,
    },
    errorText: {
        flex: 1,
        color: "white",
        fontSize: 16,
    },
    closeButton: {
        padding: 5,
    },
    progressBar: {
        height: 3,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
    },
});

export default GlobalErrorHandler;
