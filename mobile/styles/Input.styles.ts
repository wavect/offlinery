import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import styled from "styled-components/native";

export const TopLabel = styled.Text`
    font-size: ${FontSize.size_sm}px;
    font-family: ${FontFamily.montserratSemiBold};
    margin-bottom: 5px;
    align-self: flex-start;
`;

export const BottomLabel = styled.Text<{ isError?: boolean }>`
    font-size: ${FontSize.size_sm}px;
    align-self: flex-start;
`;

export const EyeIconButton = styled.TouchableOpacity`
    padding: 4px;
`;

// OTextInput specific styles
export const OTextInputContainer = styled.View`
    width: 100%;
    border-width: 1px;
    border-color: #ccc;
    border-radius: 8px;
    padding-horizontal: 12px;
`;

export const OTextInputStyled = styled.TextInput`
    width: 100%;
    font-size: 16px;
    padding-vertical: 12px;
`;

export const OTextInputTopLabel = styled(TopLabel)`
    color: ${Color.gray};
`;

export const OTextInputBottomLabel = styled(BottomLabel)`
    color: ${(props) => (props.isError ? Color.red : Color.gray)};
    font-family: ${(props) =>
        props.isError
            ? FontFamily.montserratSemiBold
            : FontFamily.montserratRegular};
    margin-top: 5px;
`;

// OTextInputWide specific styles
export const OTextInputWideContainer = styled.View`
    height: 65px;
    border-radius: 5px;
    overflow: hidden;
    background-color: ${Color.stateLayersSurfaceDimOpacity08};
    border: 1px solid ${Color.white};
`;

export const OTextInputWideStyled = styled.TextInput`
    line-height: 28px;
    font-size: ${FontSize.size_xl}px;
    font-family: ${FontFamily.montserratLight};
    font-weight: 500;
    padding: 6px;
    color: ${Color.white};
`;

export const OTextInputWideTopLabel = styled(TopLabel)`
    color: ${Color.white};
`;

export const OTextInputWideBottomLabel = styled(BottomLabel)`
    color: ${(props) => (props.isError ? Color.lightOrange : Color.white)};
    font-family: ${(props) =>
        props.isError
            ? FontFamily.montserratSemiBold
            : FontFamily.montserratRegular};
    margin-bottom: 12px;
    margin-top: 6px;
`;
