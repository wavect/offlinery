import { OModal } from "@/components/OModal/OModal";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface OGenericBadgeProps {
    label: string;
    description: string;
    // @dev MaterialIcon string name
    icon: string;
    backgroundColor: string;
    containerStyle?: ViewStyle;
}

const OGenericBadge = ({
    backgroundColor,
    containerStyle,
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
                    containerStyle,
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
        paddingVertical: Platform.select({
            ios: 4,
            android: 2,
        }),
        borderRadius: 20,
        alignSelf: "flex-start", // Add this line
    },
    label: {
        color: "white",
        fontSize: Platform.select({
            ios: 14,
            android: 12,
        }),
    },
});

export default OGenericBadge;
