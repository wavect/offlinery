import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    buttonBase: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 7,
    },
    buttonBlack: {
        backgroundColor: Color.black,
        borderColor: Color.gray,
    },
    contentContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
    buttonDanger: {
        backgroundColor: Color.red,
        borderColor: "#c00f0c",
    },
    buttonDisabled: {
        backgroundColor: Color.lightGray,
        borderColor: Color.gray,
    },
    activityIndicator: {
        marginRight: 6,
    },
});
