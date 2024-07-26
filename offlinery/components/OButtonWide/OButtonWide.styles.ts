import { Color, FontFamily, FontSize } from "../../GlobalStyles";

const baseButtonStyle = {
    justifyContent: "center",
    alignItems: "center",
    width: '90%',
    height: 65,
    borderRadius: 100,
    overflow: "hidden",
};

const baseLabelStyle = {
    textAlign: "center",
    lineHeight: 28,
    fontSize: FontSize.size_xl,
    fontFamily: FontFamily.montserratLight,
    fontWeight: "500",
};

export default {
    button: baseButtonStyle,
    buttonFilled: {
        ...baseButtonStyle,
        alignItems: "center",
    },
    buttonOutlined: {
        ...baseButtonStyle,
        alignItems: "center",
        backgroundColor: Color.stateLayersSurfaceDimOpacity08,
        borderStyle: "solid",
        borderWidth: 1,
    },
    buttonFilledDisabled: {
        backgroundColor: Color.lightGray,
    },
    buttonFilledDark: {
        backgroundColor: Color.primary,
    },
    buttonFilledLight: {
        backgroundColor: Color.white,
    },
    buttonOutlinedDisabled: {
        borderColor: Color.lightGray,
    },
    buttonOutlinedDark: {
        borderColor: Color.primary,
    },
    buttonOutlinedLight: {
        borderColor: Color.white,
    },
    btnLabel: baseLabelStyle,
    btnFilledLabelDark: {
        ...baseLabelStyle,
        color: Color.white,
    },
    btnFilledLabelLight: {
        ...baseLabelStyle,
        color: Color.primary,
    },
    btnOutlineLabelDark: {
        ...baseLabelStyle,
        color: Color.primary,
    },
    btnOutlineLabelLight: {
        ...baseLabelStyle,
        color: Color.white,
    },
    btnLabelDisabled: {
        ...baseLabelStyle,
        color: Color.lightGray,
    },
};