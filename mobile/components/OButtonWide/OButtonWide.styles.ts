import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { Platform } from "react-native";

const baseButtonStyle = {
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    padding: 18,
    borderRadius: 100,
};

const baseLabelStyle = {
    lineHeight: 28,
    fontSize: FontSize.size_xl,
    fontFamily: FontFamily.montserratLight,
};

export default {
    button: baseButtonStyle,
    buttonFilled: {
        ...baseButtonStyle,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    buttonOutlined: {
        ...baseButtonStyle,
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
        backgroundColor: Color.white,
    },
    buttonOutlinedLight: {
        borderColor: Color.white,
        backgroundColor: Color.primaryLight,
    },
    btnLabel: baseLabelStyle,
    btnDisabledLabelDark: {
        ...baseLabelStyle,
        color: Color.brightGray,
    },
    btnDisabledLabelLight: {
        ...baseLabelStyle,
        color: Color.lightGray,
    },
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
