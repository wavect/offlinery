import { Platform, StyleSheet } from "react-native";

export default {
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        width: "100%",
    },
    content: {
        flex: 1,
        backgroundColor: "transparent",
    },
    buttonContainer: {
        backgroundColor: "transparent",
        alignItems: "center",
        width: "100%",
        marginTop: "auto",
        ...Platform.select({
            ios: {
                marginBottom: 10,
            },
        }),
    },
    iconContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        zIndex: -1, // Place the icon behind other content
    },
};
