import { Color } from "@/GlobalStyles";
import { CheckboxContainer, CheckboxLabel } from "@/styles/Checkbox.styles";
import Checkbox from "expo-checkbox";
import React from "react";

interface IOCheckboxProps {
    label: string;
    checkboxState: boolean;
    onValueChange: (value: boolean) => void;
}

export const OCheckbox: React.FC<IOCheckboxProps> = ({
    label,
    onValueChange,
    checkboxState,
}) => {
    return (
        <CheckboxContainer>
            <Checkbox
                value={checkboxState}
                onValueChange={onValueChange}
                color={Color.primary}
            />
            <CheckboxLabel>{label}</CheckboxLabel>
        </CheckboxContainer>
    );
};
