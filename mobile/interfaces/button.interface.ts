import { IOButtonSmallVariant } from "@/styles/Button.styles";

export interface IOButtonSmallProps {
    onPress: () => Promise<void> | void;
    label: string;
    isDisabled?: boolean;
    variant?: IOButtonSmallVariant;
    fullWidth?: boolean;
}
