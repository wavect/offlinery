import { UserPublicDTOIntentionsEnum } from "@/api/gen/src";
import { i18n, TR } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OBadgeProps {
    intention: UserPublicDTOIntentionsEnum;
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

const OBadge = ({ intention }: OBadgeProps) => {
    const [showModal, setShowModal] = useState(false);
    const { icon, backgroundColor, description, label } =
        intentionConfig[intention];

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={[styles.badge, { backgroundColor }]}
            >
                <MaterialIcons name={icon as any} size={16} color="white" />
                <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
                animationType="fade"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{description}</Text>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 8,
        width: "80%",
        maxWidth: 300,
    },
    modalText: {
        fontSize: 16,
        textAlign: "center",
    },
});

export default OBadge;
