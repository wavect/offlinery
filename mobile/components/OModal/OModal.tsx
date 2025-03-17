import React from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface OModalProps {
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    text: string;
}

export const OModal = ({ showModal, setShowModal, text }: OModalProps) => {
    return (
        <Modal
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
            animationType="fade"
            statusBarTranslucent={Platform.OS === "android"}
            hardwareAccelerated={Platform.OS === "android"}
            presentationStyle="overFullScreen"
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowModal(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>{text}</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    androidShadow: {
        elevation: 5,
    },
    modalText: {
        fontSize: 16,
        textAlign: "center",
    },
});
