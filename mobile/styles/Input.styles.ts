import { Color } from "@/GlobalStyles";
import styled from "styled-components/native";

export const EyeIconButton = styled.TouchableOpacity`
    padding: 4px;
`;

export const OTextInputContainer = styled.View<{
    variant?: "primary" | "white";
}>`
    width: 100%;
    padding-horizontal: 12px;
    flex-direction: row;
    align-items: center;
    height: 56px;
    border: 2px solid
        ${(props) => (props.variant === "primary" ? Color.primary : "white")};
    border-radius: 8px;
`;

export const OTextInputStyled = styled.TextInput.attrs<{
    variant?: "primary" | "white";
}>((props) => ({
    placeholderTextColor:
        props.variant === "primary" ? Color.gray : Color.white,
}))`
    width: 90%;
    font-size: 16px;
    padding-vertical: 12px;
    color: ${(props) => (props.variant === "primary" ? "black" : "white")};
`;
