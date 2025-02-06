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
import React, { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MODAL_MARGIN = 20;
const MODAL_MAX_WIDTH = 400;

export interface IOMessageModalProps {
    userId: string;
    encounterId: string;
    visible: boolean;
    onClose: (e?: any) => void;
    firstName: string;
}

const OMessageModal = (props: IOMessageModalProps) => {
    const { visible, onClose, encounterId, userId, firstName } = props;
    const [message, setMessage] = useState("");
    const [messageError, setMessageError] = useState<boolean>(false);
    const [keyboardHeight] = useState(new Animated.Value(0));

    const modalWidth = Math.min(
        SCREEN_WIDTH - MODAL_MARGIN * 2,
        MODAL_MAX_WIDTH,
    );

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                Animated.timing(keyboardHeight, {
                    toValue: e.endCoordinates.height,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
            },
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                Animated.timing(keyboardHeight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
            },
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    const handleSend = async () => {
        const pushMessageDTO: PushMessageDTO = {
            content: message.trim(),
            encounterId: encounterId,
        };
        try {
            await API.encounter.encounterControllerPushMessage({
                userId,
                pushMessageDTO,
            });
            onClose();
            setMessage("");
            setMessageError(false);
        } catch (error) {
            console.error("Unable to send dm: ", error);
            setMessageError(true);
            Sentry.captureException(error, {
                tags: {
                    chat: "message",
                },
            });
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.centeredView}>
                        <KeyboardAvoidingView
                            behavior={
                                Platform.OS === "ios" ? "padding" : "height"
                            }
                            keyboardVerticalOffset={
                                Platform.OS === "ios" ? -64 : 0
                            }
                        >
                            <Animated.View
                                style={[
                                    styles.modalView,
                                    {
                                        width: modalWidth,
                                        transform: [
                                            {
                                                translateY:
                                                    keyboardHeight.interpolate({
                                                        inputRange: [0, 300],
                                                        outputRange: [0, -100],
                                                        extrapolate: "clamp",
                                                    }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={onClose}
                                    hitSlop={20}
                                >
                                    <Text style={styles.closeButtonText}>
                                        ×
                                    </Text>
                                </Pressable>

                                <View style={styles.contentContainer}>
                                    <Text style={styles.modalTitle}>
                                        {i18n.t(TR.leaveMessage)}
                                    </Text>

                                    <TextInput
                                        testID={
                                            TestData.encounters
                                                .inputEncounterSendMessage
                                        }
                                        style={styles.modalTextInput}
                                        onChangeText={setMessage}
                                        value={message}
                                        placeholder={i18n.t(TR.enterMessage)}
                                        placeholderTextColor={Color.gray}
                                        multiline
                                        maxLength={500}
                                        textAlignVertical="top"
                                    />

                                    {messageError && (
                                        <Text style={styles.modalError}>
                                            {i18n.t(TR.messageUnableToSend)}
                                        </Text>
                                    )}

                                    <View style={styles.buttonContainer}>
                                        <OButtonSmall
                                            testID={
                                                TestData.encounters
                                                    .buttonEncounterSendMessage
                                            }
                                            label={i18n.t(TR.sendMessage)}
                                            variant={IOButtonSmallVariant.Black}
                                            containerStyle={styles.sendButton}
                                            isDisabled={!message.trim()}
                                            onPress={handleSend}
                                        />
                                    </View>

                                    <Text style={styles.modalFooter}>
                                        {i18n.t(TR.messageWarning, {
                                            firstName,
                                        })}
                                    </Text>
                                </View>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: MODAL_MARGIN,
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    contentContainer: {
        width: "100%",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        right: 16,
        top: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Color.redDark,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 24,
        color: Color.white,
        lineHeight: 32,
    },
    modalTitle: {
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratSemiBold,
        marginBottom: 16,
        textAlign: "center",
        marginTop: 8,
        color: Color.black,
    },
    modalTextInput: {
        height: 120,
        width: "100%",
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: Color.lightGray,
        borderRadius: 12,
        padding: 12,
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_md,
        backgroundColor: "#FAFAFA",
    },
    buttonContainer: {
        width: "100%",
        marginTop: 8,
    },
    sendButton: {
        width: "100%",
        minHeight: 44,
        justifyContent: "center",
    },
    modalFooter: {
        marginTop: 16,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        textAlign: "center",
        color: Color.gray,
        paddingHorizontal: 16,
    },
    modalError: {
        marginVertical: 12,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        textAlign: "center",
        color: Color.redDark,
    },
});

export default OMessageModal;
