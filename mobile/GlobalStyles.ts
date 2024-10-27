/* fonts */
import { StyleProp, TextStyle } from "react-native";

export const FontFamily = {
    montserratSemiBold: "Montserrat_600SemiBold",
    montserratMedium: "Montserrat_500Medium",
    montserratRegular: "Montserrat_400Regular",
    montserratLight: "Montserrat_300Light",
};

/* font sizes */
export const FontSize = {
    size_xs: 12,
    size_sm: 14,
    size_md: 16,
    size_lg: 18,
    size_xl: 20,
};
/* Colors */
export const Color = {
    black: "#000",
    white: "#fff",
    red: "#d33131",
    /** @dev Great to use as error color on blue color backgrounds */
    lightOrange: "#FFD580",
    /** @dev general error color */
    redLight: "#fb3310",
    redDark: "#ea2200",
    primaryBright: "#81c5c9",
    primaryLight: "#459da1",
    primary: "#36797d",
    gray: "#757575",
    lightGray: "#a9a9a9",
    lighterGray: "#dedede",
    brightGray: "#efefef",
    brightestGray: "rgba(239, 239, 239, 0.5)",
    stateLayersSurfaceDimOpacity08: "rgba(222, 216, 225, 0.08)",
    schemesPrimary: "#65558f",
};

export const Title: StyleProp<TextStyle> = {
    fontSize: 40,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
};
export const Subtitle: StyleProp<TextStyle> = {
    fontSize: FontSize.size_md,
    color: Color.gray,
    marginBottom: 24,
};

export const ErrorMessage: StyleProp<TextStyle> = {
    color: Color.redLight,
    fontSize: 16,
    fontFamily: FontFamily.montserratSemiBold,
    textAlign: "left",
    marginBottom: 16,
};

export const Padding = {
    p_5xl: 24,
    p_3xs: 10,
    p_base: 16,
    p_xs: 12,
    p_5xs: 8,
    p_2xs: 11,
    p_7xs: 6,
    p_xl: 20,
    p_9xs: 4,
};

export const BorderRadius = {
    br_81xl: 100,
    br_base: 16,
    br_5xs: 8,
    br_7xs: 6,
    br_9xs: 4,
};
