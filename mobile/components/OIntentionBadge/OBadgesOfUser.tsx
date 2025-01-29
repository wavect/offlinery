import { UserPublicDTOIntentionsEnum } from "@/api/gen/src";
import OIntentionBadge from "@/components/OIntentionBadge/OIntentionBadge";
import React from "react";
import { View } from "react-native";

interface IOBadgesOfUserProps {
    intentions: UserPublicDTOIntentionsEnum[];
    /** @dev Hide label of badges to save space, clicking on it will still reveal additional information */
    hideLabel?: boolean;
}

export const OBadgesOfUser = (props: IOBadgesOfUserProps) => {
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {props.intentions?.map((i) => (
                <OIntentionBadge
                    key={i}
                    intention={i}
                    hideLabel={props.hideLabel}
                />
            ))}
        </View>
    );
};
