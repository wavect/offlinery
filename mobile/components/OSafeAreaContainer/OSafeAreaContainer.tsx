import { SpaceBetweenContainer } from "@/styles/View.styles";
import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IOSafeAreaContainerProps {
    children: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

/** @dev It's bad practice to use SafeAreaView, for that reason we use the insets. This component makes sure no elements are interrupting with e.g. camera holes etc.
 * @ref https://reactnavigation.org/docs/handling-safe-area/#tweak-paddings-for-more-control */
export const OSafeAreaContainer = (props: IOSafeAreaContainerProps) => {
    const { children, containerStyle } = props;
    const insets = useSafeAreaInsets();

    return (
        <SpaceBetweenContainer
            style={[
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}
        >
            {children}
        </SpaceBetweenContainer>
    );
};
