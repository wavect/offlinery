import { UserPublicDTOIntentionsEnum } from "@/api/gen/src";
import { OModal } from "@/components/OModal/OModal";
import { i18n, TR } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface OBadgeProps {
    intention: UserPublicDTOIntentionsEnum;
    hideLabel?: boolean;
}

const intentionConfig = {
    [UserPublicDTOIntentionsEnum.casual]: {
        icon: "sentiment-very-satisfied",
        label: i18n.t(TR.casual),
        backgroundColor: "#36797d",
        description: i18n.t(TR.casualDescription),
    },
    [UserPublicDTOIntentionsEnum.friendship]: {
        icon: "diversity-3",
        label: i18n.t(TR.friendship),
        backgroundColor: "#38538c",
        description: i18n.t(TR.friendshipDescription),
    },
    [UserPublicDTOIntentionsEnum.relationship]: {
        icon: "favorite",
        label: i18n.t(TR.relationship),
        backgroundColor: "#833467",
        description: i18n.t(TR.relationshipDescription),
    },
};

const OBadge = ({ intention, hideLabel }: OBadgeProps) => {
    const [showModal, setShowModal] = useState(false);
    const { icon, backgroundColor, description, label } =
        intentionConfig[intention];

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={[
                    styles.badge,
                    { backgroundColor },
                    hideLabel ? { paddingLeft: 12, paddingRight: 12 } : null,
                ]}
            >
                <MaterialIcons name={icon as any} size={16} color="white" />
                {!hideLabel && <Text style={styles.label}>{label}</Text>}
            </TouchableOpacity>

            <OModal
                setShowModal={setShowModal}
                showModal={showModal}
                text={description}
            />
        </>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: "flex-start", // Add this line
    },
    label: {
        color: "white",
        fontSize: 14,
    },
});

export default OBadge;
