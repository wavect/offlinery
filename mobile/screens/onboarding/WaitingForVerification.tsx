import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserPrivateDTOVerificationStatusEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTroubleMessage } from "@/components/OTroubleMessage/OTroubleMessage";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { refreshUserData } from "@/services/auth.service";
import { API } from "@/utils/api-config";
import { MAIN_WEBSITE } from "@/utils/general.constants";
import { getLocalLanguageID, writeSupportEmail } from "@/utils/misc.utils";
import * as React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const WaitingForVerification = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.WaitingVerification
>) => {
    const { state, dispatch } = useUserContext();

    const reloadUserState = async () => {
        if (!state.id) {
            // @dev This should only happen if user did not login or register and for some reason is on this screen (semantically impossible, except during debug sessions)
            throw new Error("No user ID found!");
        }
        const updatedUser = await API.user.userControllerGetOwnUserData({
            userId: state.id!,
        });
        refreshUserData(dispatch, updatedUser);
    };

    const openVerificationCallPDF = async () => {
        await Linking.openURL(
            `${MAIN_WEBSITE}/verification-call/verification-call_${getLocalLanguageID()}.pdf`,
        );
    };

    return (
        <OPageColorContainer refreshFunc={reloadUserState}>
            <View style={styles.btnContainer}>
                <OButtonWide
                    filled={true}
                    text={i18n.t(
                        state.verificationStatus !==
                            UserPrivateDTOVerificationStatusEnum.verified
                            ? TR.verificationInProgress
                            : TR.verificationSuccessful,
                    )}
                    disabled={
                        state.verificationStatus !==
                        UserPrivateDTOVerificationStatusEnum.verified
                    }
                    style={styles.btn}
                    onPress={() => navigation.navigate(ROUTES.MainTabView)}
                    variant="light"
                />
                <Text
                    numberOfLines={1}
                    style={styles.verificationCallQuestions}
                    onPress={openVerificationCallPDF}
                    adjustsFontSizeToFit={true}
                >
                    {i18n.t(TR.verificationCallQuestions)}
                </Text>

                {state.verificationStatus !==
                    UserPrivateDTOVerificationStatusEnum.verified && (
                    <>
                        <OButtonWide
                            filled={false}
                            text={i18n.t(TR.bookNewCall)}
                            variant="light"
                            style={[styles.btn, { marginTop: 30 }]}
                            onPress={() =>
                                navigation.navigate(
                                    ROUTES.Onboarding.BookSafetyCall,
                                )
                            }
                        />
                        <Text style={styles.subtitleBookCall}>
                            {i18n.t(TR.pleaseDoNotMakeDoubleBookings)}
                        </Text>
                    </>
                )}
            </View>

            <OTroubleMessage
                action={writeSupportEmail}
                label={i18n.t(TR.somethingWrongQ)}
            />
        </OPageColorContainer>
    );
};

const styles = StyleSheet.create({
    btnContainer: {
        width: "100%",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    btn: {
        marginBottom: 12,
    },
    subtitleBookCall: {
        fontSize: FontSize.size_sm,
        color: Color.brightGray,
        fontFamily: FontFamily.montserratLight,
    },
    verificationCallQuestions: {
        color: Color.brightGray,
        textDecorationLine: "underline",
        fontSize: FontSize.size_sm,
        paddingBottom: 10,
        paddingHorizontal: 10, // @dev To increase "clickable size" for link
        fontFamily: FontFamily.montserratLight,
    },
});

export default WaitingForVerification;
