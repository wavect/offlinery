import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { TR, i18n } from "@/localization/translate.service";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const OMessageModal = ({ visible, onClose, onSend }) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        onSend(message);
        setMessage("");
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>×</Text>
                    </Pressable>
                    <Text style={styles.modalTitle}>
                        {i18n.t(TR.leaveMessage)}
                    </Text>
                    <Text style={styles.modalText}>
                        {i18n.t(TR.messageInstructions)}
                    </Text>
                    <TextInput
                        style={styles.modalTextInput}
                        onChangeText={setMessage}
                        value={message}
                        placeholder={i18n.t(TR.enterMessage)}
                        multiline
                    />
                    <Pressable
                        style={[
                            styles.button,
                            styles.buttonClose,
                            !message.trim() && styles.buttonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!message.trim()}
                    >
                        <Text style={styles.textStyle}>
                            {i18n.t(TR.sendMessage)}
                        </Text>
                    </Pressable>
                    <Text style={styles.modalFooter}>
                        {i18n.t(TR.messageWarning)}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "90%",
        maxWidth: 400,
    },
    closeButton: {
        position: "absolute",
        right: 10,
        top: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Color.lightGray,
    },
    closeButtonText: {
        fontSize: FontSize.size_xl,
        color: Color.white,
        lineHeight: 30,
    },
    modalTitle: {
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratSemiBold,
        marginBottom: 15,
        textAlign: "center",
        marginTop: 10,
    },
    modalText: {
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratRegular,
        marginBottom: 15,
        textAlign: "center",
    },
    modalTextInput: {
        height: 100,
        width: "100%",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Color.lightGray,
        borderRadius: 8,
        padding: 10,
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_md,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        paddingHorizontal: 20,
    },
    buttonClose: {
        backgroundColor: Color.primary,
    },
    buttonDisabled: {
        backgroundColor: Color.lightGray,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: FontFamily.montserratMedium,
        fontSize: FontSize.size_md,
    },
    modalFooter: {
        marginTop: 15,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        textAlign: "center",
        color: Color.gray,
    },
});

export default OMessageModal;
