import { UserPublicDTOIntentionsEnum } from "@/api/gen/src";
import OBadge from "@/components/OBadge/OBadge";
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
                <OBadge key={i} intention={i} hideLabel={props.hideLabel} />
            ))}
        </View>
    );
};
