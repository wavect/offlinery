import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { PushMessageDTO } from "@/api/gen/src";
import {
    IOButtonSmallVariant,
    OButtonSmall,
} from "@/components/OButtonSmall/OButtonSmall";
import { TR, i18n } from "@/localization/translate.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface IOMessageModalProps {
    userId: string;
    encounterId: string;
    visible: boolean;
    onClose: (e?: any) => void;
    testID?: string;
}

const OMessageModal = (props: IOMessageModalProps) => {
    const { visible, onClose, encounterId, userId, testID } = props;
    const [message, setMessage] = useState("");
    const [messageError, setMessageError] = useState<boolean>(false);

    const handleSend = async () => {
        const pushMessageDTO: PushMessageDTO = {
            content: message,
            encounterId: encounterId,
        };
        try {
            await API.encounter.encounterControllerPushMessage({
                userId,
                pushMessageDTO,
            });
            // only close, if message was successful, otherwise let user re-send or close it
            onClose();
            setMessageError(false);
        } catch (error) {
            console.error("Unable to send dm: ", error);
            setMessageError(true);
            setMessage("");
            Sentry.captureException(error, {
                tags: {
                    chat: "message",
                },
            });
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            testID={testID}
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
                        testID={TestData.encounters.inputEncounterSendMessage}
                        style={styles.modalTextInput}
                        onChangeText={setMessage}
                        value={message}
                        placeholder={i18n.t(TR.enterMessage)}
                        placeholderTextColor={Color.gray}
                        multiline
                    />
                    {messageError && (
                        <Text style={styles.modalError}>
                            {i18n.t(TR.messageUnableToSend)}
                        </Text>
                    )}
                    <OButtonSmall
                        testID={TestData.encounters.buttonEncounterSendMessage}
                        label={i18n.t(TR.sendMessage)}
                        variant={IOButtonSmallVariant.Black}
                        containerStyle={{ width: "100%" }}
                        isDisabled={!message.trim()}
                        onPress={handleSend}
                    />
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
    modalFooter: {
        marginTop: 15,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        textAlign: "center",
        color: Color.gray,
    },
    modalError: {
        marginTop: 15,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        textAlign: "center",
        color: Color.redDark,
        marginBottom: 10,
    },
});

export default OMessageModal;
