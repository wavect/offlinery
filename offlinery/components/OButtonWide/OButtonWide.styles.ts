import {Color, FontFamily, FontSize} from "../../GlobalStyles";

export default {
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: '90%',
        height: 65,
        borderRadius: 100,
        overflow: "hidden",
    },
    buttonFilled: {
        backgroundColor: Color.white,
        alignItems: "center",
    },
    btnFilledLbl: {
        color: "#36797d",
        textAlign: "center",
        lineHeight: 28,
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
    },
    btnOutlineLbl: {
        color: Color.white,
        textAlign: "center",
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        lineHeight: 28,
        fontSize: FontSize.size_xl,
    },
    buttonOutlined: {
        backgroundColor: Color.stateLayersSurfaceDimOpacity08,
        borderStyle: "solid",
        borderColor: Color.white,
        borderWidth: 1,
        alignItems: "center",
    },
}