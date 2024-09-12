import { Platform } from "react-native";

export default {
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        width: "100%",
    },
    content: {
        flex: 1,
    },
    buttonContainer: {
        alignItems: "center",
        width: "100%",
        marginTop: "auto",
        ...Platform.select({
            ios: {
                marginBottom: 10,
            },
        }),
    },
};
