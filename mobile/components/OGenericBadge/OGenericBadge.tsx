import { OModal } from "@/components/OModal/OModal";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface OGenericBadgeProps {
    label: string;
    description: string;
    // @dev MaterialIcon string name
    icon: string;
    backgroundColor: `#${string}`;
}

const OGenericBadge = ({
    backgroundColor,
    description,
    icon,
    label,
}: OGenericBadgeProps) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={[
                    styles.badge,
                    { backgroundColor },
                    label ? null : { paddingLeft: 12, paddingRight: 12 },
                ]}
            >
                <MaterialIcons name={icon as any} size={16} color="white" />
                {label && <Text style={styles.label}>{label}</Text>}
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

export default OGenericBadge;
