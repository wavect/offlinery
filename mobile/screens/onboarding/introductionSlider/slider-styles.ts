import { Color, FontFamily } from "@/GlobalStyles";
import { Platform, StyleSheet } from "react-native";

export const introductionSliderStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
    },
    button: {
        width: "100%",
    },
    dot: {
        backgroundColor: "rgba(255,255,255,.3)",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    activeDot: {
        backgroundColor: "#fff",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    imageContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    slide: {
        flex: 1,
        paddingRight: 24,
        paddingLeft: 24,
        paddingBottom: 0,
        textAlign: "left",
    },
    skipButton: {
        width: 100,
    },
    title: {
        fontFamily: FontFamily.montserratSemiBold,
        fontSize: 36,
        fontWeight: "bold",
        color: "white",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "left",
    },
    description: {
        fontFamily: FontFamily.montserratMedium,
        fontSize: 16,
        color: "white",
        lineHeight: 28,
    },
    additionalText: {
        fontFamily: FontFamily.montserratRegular,
        fontSize: 18,
        color: "white",
        marginBottom: 10,
    },
    additionalTextBold: {
        fontFamily: FontFamily.montserratSemiBold,
        fontSize: 20,
        color: "white",
        marginBottom: 10,
    },
    divideContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "white",
        width: "50%",
        marginVertical: 20,
    },
    image: {
        width: "100%",
        height: 250,
    },
    oneLineTextContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    pageIndicator: {
        marginLeft: 30,
        fontFamily: FontFamily.montserratSemiBold,
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    skipLink: {
        marginRight: 30,
        fontFamily: FontFamily.montserratSemiBold,
        color: "white",
        fontSize: 20,
        textDecorationLine: "none",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: Platform.OS === "ios" ? 40 : 20,
        paddingHorizontal: 20, // Add some horizontal padding
    },
    buttonContainer: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
    },
    navigationButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    pressableIconBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowRadius: 3.84,
        elevation: 5,
    },
    registerNowContainer: {
        display: "flex",
        flexDirection: "row",
        padding: 10,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowRadius: 3.84,
        elevation: 5,
    },
    registerNowText: {
        fontFamily: FontFamily.montserratSemiBold,
        color: Color.primary,
        fontSize: 16,
    },
    invisibleButton: {
        opacity: 0,
    },
    bottomAdditionalContainer: {
        position: "absolute",
        left: "0%",
        right: "0%",
        bottom: 10,
    },
    fixedSizeViewContainer: {
        minHeight: 100,
    },
});
