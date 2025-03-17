import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { TR, i18n } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ONotNearbyAnymoreProps {
    otherUserFirstName: string;
    setModalVisible: Dispatch<SetStateAction<boolean>>;
}

const NotNearbyAnymore = ({
    otherUserFirstName,
    setModalVisible,
}: ONotNearbyAnymoreProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <MaterialIcons
                    name="sentiment-dissatisfied"
                    size={48}
                    color={Color.primary}
                    style={styles.mainIcon}
                />
                <Text style={styles.mainTitle}>
                    {i18n.t(TR.missedEachOther)}
                </Text>
                <Text style={styles.subtitle}>
                    {i18n.t(TR.notNearbyAnymore, {
                        firstName: otherUserFirstName,
                    })}
                </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomSection}>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.messageRow}
                >
                    <MaterialIcons
                        name="message"
                        size={24}
                        color={Color.primary}
                        style={styles.messageIcon}
                    />
                    <Text style={styles.messageText}>
                        {i18n.t(TR.canStillSendMessage, {
                            firstName: otherUserFirstName,
                        })}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.notificationText}>
                    {i18n.t(TR.willNotifyAgainIn24h, {
                        firstName: otherUserFirstName,
                    })}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        marginHorizontal: 16,
        marginVertical: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    topSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    mainIcon: {
        marginBottom: 16,
    },
    mainTitle: {
        fontFamily: FontFamily.montserratSemiBold,
        fontSize: FontSize.size_lg,
        color: Color.black,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_md,
        color: "#666666",
        textAlign: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginVertical: 24,
    },
    bottomSection: {
        gap: 16,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    messageIcon: {
        marginRight: 12,
    },
    messageText: {
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_md,
        color: "#4A4A4A",
        flex: 1,
    },
    notificationText: {
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_sm,
        color: "#787878",
        marginTop: 16,
    },
});

export default NotNearbyAnymore;
