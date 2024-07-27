import { Color, FontFamily } from "../../GlobalStyles";

export default {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
    },
    offlineryFlexBox: {
        lineHeight: 52,
        display: "flex",
        color: Color.white,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    headlineContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headlineText: {
        fontSize: 48,
        lineHeight: 52,
        fontWeight: "600",
        fontFamily: FontFamily.montserratRegular,
        width: 216,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: Color.white,
    },
    subtitle: {
        fontSize: 22,
        lineHeight: 44,
        fontWeight: "500",
        fontFamily: FontFamily.montserratLight,
        width: 390,
        textAlign: 'center',
        marginBottom: 70,
    },
}