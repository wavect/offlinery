import {Color, FontFamily} from "../../GlobalStyles";

export default {
    offlineryFlexBox: {
        lineHeight: 52,
        display: "flex",
        color: Color.m3White,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    headlinePosition: {
        top: 0,
        position: "absolute",
    },
    icon: {
        left: 0,
        width: 53,
        height: 44,
    },
    subtitle: {
        top: 411,
        left: 18,
        fontSize: 22,
        lineHeight: 44,
        fontWeight: "500",
        fontFamily: FontFamily.montserratLight,
        width: 390,
        height: 61,
        position: "absolute",
    },
    headlineContainer: {
        top: 367,
        left: 78,
        width: 269,
        height: 54,
        position: "absolute",
    },
    headlineText: {
        left: 53,
        fontSize: 48,
        lineHeight: 52,
        fontWeight: "600",
        fontFamily: FontFamily.montserratRegular,
        width: 216,
        height: 54,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        textAlign: "center",
        color: Color.m3White,
    }
}