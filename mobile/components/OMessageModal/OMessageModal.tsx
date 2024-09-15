import { Color } from "@/GlobalStyles";
import { EncounterApi, PushMessageDTO } from "@/api/gen/src";
import {
    IOButtonSmallVariant,
    OButtonSmall,
} from "@/components/OButtonSmall/OButtonSmall";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { SText } from "@/styles/Text.styles";
import { getJwtHeader } from "@/utils/misc.utils";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

interface IOMessageModalProps {
    userId: string;
    encounterId: string;
    visible: boolean;
    onClose: (e: any) => void;
}

const encounterApi = new EncounterApi();
const OMessageModal = (props: IOMessageModalProps) => {
    const { dispatch, state } = useUserContext();
    const { visible, onClose, encounterId, userId } = props;
    const [message, setMessage] = useState("");

    const handleSend = async () => {
        const pushMessageDTO: PushMessageDTO = {
            content: message,
            encounterId: encounterId,
        };
        await encounterApi.encounterControllerPushMessage(
            {
                userId,
                pushMessageDTO,
            },
            getJwtHeader(state.jwtAccessToken),
        );
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
                        <SText.Medium>×</SText.Medium>
                    </Pressable>
                    <SText.Medium>{i18n.t(TR.leaveMessage)}</SText.Medium>
                    <SText.Medium>
                        {i18n.t(TR.messageInstructions)}
                    </SText.Medium>
                    <TextInput
                        onChangeText={setMessage}
                        value={message}
                        placeholder={i18n.t(TR.enterMessage)}
                        multiline
                    />
                    <OButtonSmall
                        label={i18n.t(TR.sendMessage)}
                        variant={IOButtonSmallVariant.Black}
                        isDisabled={!message.trim()}
                        fullWidth={true}
                        onPress={handleSend}
                    />
                    <SText.Small>{i18n.t(TR.messageWarning)}</SText.Small>
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
});

export default OMessageModal;
