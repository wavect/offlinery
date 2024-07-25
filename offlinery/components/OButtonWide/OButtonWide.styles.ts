import {Color, FontFamily, FontSize} from "../../GlobalStyles";

export default {
    button: {
        justifyContent: "center",
        alignItems: "center",
    },
    buttonFilled: {
        top: 651,
        left: 22,
        backgroundColor: Color.white,
        width: 382,
        height: 64,
        borderRadius: 100,
        alignItems: "center",
        position: "absolute",
        overflow: "hidden",
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
        top: 741,
        left: 23,
        backgroundColor: Color.stateLayersSurfaceDimOpacity08,
        borderStyle: "solid",
        borderColor: Color.white,
        borderWidth: 1,
        width: 383,
        height: 65,
        borderRadius: 100,
        alignItems: "center",
        position: "absolute",
        overflow: "hidden",
    },
    btnStateLayer: {
        alignSelf: "stretch",
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingVertical: 10,
        alignItems: "center",
        flex: 1,
    }
}