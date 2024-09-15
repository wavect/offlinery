import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { GestureResponderEvent, Platform } from "react-native";
import styled from "styled-components/native";

export type StyleVariant = "dark" | "light";
export type ButtonSize = "default" | "smaller";

export enum IOButtonSmallVariant {
    Danger = "danger",
    Black = "black",
}

export interface IOButtonWideProps {
    text: string;
    filled: boolean;
    variant: StyleVariant;
    onPress?: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    countdownEnableSeconds?: number;
    isLoading?: boolean;
    loadingBtnText?: string;
    size?: ButtonSize;
}

const baseButtonStyle = `
  justify-content: center;
  align-items: center;
  padding: 18px;
  border-radius: 100px;
`;

const baseButtonFilledStyle = `
  ${baseButtonStyle}
  ${Platform.select({
      ios: `
      shadow-color: #000;
      shadow-offset: 0px 2px;
      shadow-opacity: 0.25;
      shadow-radius: 3.84px;
    `,
      android: `
      elevation: 5;
    `,
  })}
`;

const baseButtonOutlinedStyle = `
  ${baseButtonStyle}
  border-style: solid;
  border-width: 1px;
`;

const baseLabelStyle = `
  font-family: ${FontFamily.montserratLight};
`;

export const OButtonWideBase = styled.Pressable<{
    filled: boolean;
    variant: StyleVariant;
    disabled: boolean;
}>`
    ${({ filled }) =>
        filled ? baseButtonFilledStyle : baseButtonOutlinedStyle}
    width: 100%;
    background-color: ${({ filled, variant, disabled }) =>
        disabled
            ? Color.lightGray
            : filled
              ? variant === "dark"
                  ? Color.primary
                  : Color.white
              : variant === "dark"
                ? Color.white
                : Color.primaryLight};
    border-color: ${({ filled, variant, disabled }) =>
        disabled
            ? Color.lightGray
            : filled
              ? "transparent"
              : variant === "dark"
                ? Color.primary
                : Color.white};
    ${({ disabled, filled }) =>
        disabled && filled && `elevation: 0; shadow-color: transparent;`}
    marginTop: 8px
`;

export const OButtonWideText = styled.Text<{
    filled: boolean;
    variant: StyleVariant;
    disabled: boolean;
    size: ButtonSize;
}>`
    ${baseLabelStyle}
    line-height: ${({ size }) => (size === "smaller" ? "18px" : "28px")};
    font-size: ${({ size }) =>
        size === "smaller" ? FontSize.size_md : FontSize.size_xl}px;
    color: ${({ filled, variant, disabled }) =>
        disabled
            ? filled
                ? Color.brightGray
                : Color.lightGray
            : filled
              ? variant === "dark"
                  ? Color.white
                  : Color.primary
              : variant === "dark"
                ? Color.primary
                : Color.white};
`;

export const ButtonBase = styled.Pressable<{
    variant: IOButtonSmallVariant;
    isDisabled: boolean;
    fullWidth: boolean;
}>`
    ${baseButtonStyle};
    width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
    border-width: 1px;
    border-radius: 8px;
    padding: 7px;
    background-color: ${({ isDisabled, variant }) =>
        isDisabled
            ? Color.lightGray
            : variant === IOButtonSmallVariant.Danger
              ? Color.red
              : Color.black};
    border-color: ${({ isDisabled, variant }) =>
        isDisabled
            ? Color.gray
            : variant === IOButtonSmallVariant.Danger
              ? "#c00f0c"
              : Color.gray};
`;

export const ButtonText = styled.Text`
    ${baseLabelStyle};
    color: ${Color.white};
    font-size: ${FontSize.size_md}px;
`;

export const ContentContainer = styled.View`
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

export const StyledActivityIndicator = styled.ActivityIndicator`
    margin-right: 6px;
`;
