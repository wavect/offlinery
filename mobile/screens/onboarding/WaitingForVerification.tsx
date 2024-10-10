import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserPrivateDTOVerificationStatusEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTroubleMessage } from "@/components/OTroubleMessage/OTroubleMessage";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { refreshUserData } from "@/services/auth.service";
import { API } from "@/utils/api-config";
import { MAIN_WEBSITE } from "@/utils/general.constants";
import { getLocalLanguageID, writeSupportEmail } from "@/utils/misc.utils";
import * as React from "react";
import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const WaitingForVerification = ({
    navigation,
    route,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.WaitingVerification
>) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setIsLoading] = useState(false);
    const [dots, setDots] = useState("");

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => {
                if (prevDots.length >= 3) return "";
                return prevDots + ".";
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const reloadUserState = async () => {
        if (!state.id) {
            // @dev This should only happen if user did not login or register and for some reason is on this screen (semantically impossible, except during debug sessions)
            throw new Error("No user ID found!");
        }
        const updatedUser = await API.user.userControllerGetOwnUserData({
            userId: state.id!,
        });
        refreshUserData(dispatch, updatedUser);

        if (updatedUser.verificationStatus === "verified") {
            navigation.replace(ROUTES.MainTabView);
        }
    };

    const openVerificationCallPDF = async () => {
        await Linking.openURL(
            `${MAIN_WEBSITE}/verification-call/verification-call_${getLocalLanguageID()}.pdf`,
        );
    };

    const switchToBeApproached = async () => {
        if (!state.id) {
            // @dev This should only happen if user did not login or register and for some reason is on this screen (semantically impossible, except during debug sessions)
            throw new Error("No user ID found!");
        }
        setIsLoading(true);

        await API.user.userControllerUpdateUser({
            userId: state.id,
            updateUserDTO: {
                approachChoice: "be_approached",
            },
        });

        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: {
                approachChoice: "be_approached",
                verificationStatus: "not_needed",
            },
        });

        setIsLoading(false);
        navigation.replace(ROUTES.MainTabView);
    };

    return (
        <OPageColorContainer refreshFunc={reloadUserState}>
            <View style={styles.btnContainer}>
                <Text style={styles.verificationInProgress}>
                    {(route.params?.overrideLabel ??
                        i18n.t(TR.verificationInProgress)) + dots}
                </Text>

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
                            filled={true}
                            text={i18n.t(TR.bookNewCall)}
                            variant="light"
                            style={[styles.btn, { marginTop: 30 }]}
                            onPress={() =>
                                navigation.navigate(
                                    ROUTES.Onboarding.BookSafetyCall,
                                    {
                                        onCallBooked: () =>
                                            navigation.replace(
                                                ROUTES.Onboarding
                                                    .WaitingVerification,
                                                {
                                                    overrideLabel: i18n.t(
                                                        TR.verificationInProgress,
                                                    ),
                                                },
                                            ),
                                    },
                                )
                            }
                        />
                        <Text style={styles.subtitle}>
                            {i18n.t(TR.pleaseDoNotMakeDoubleBookings)}
                        </Text>
                        <OButtonWide
                            isLoading={isLoading}
                            filled={false}
                            text={i18n.t(TR.switchToBeApproached)}
                            variant="light"
                            style={[styles.btn, { marginTop: 30 }]}
                            onPress={switchToBeApproached}
                            numberOfLines={1}
                        />
                        <Text style={styles.subtitle}>
                            {i18n.t(TR.whySwitchToBeApproached)}
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
    subtitle: {
        fontSize: FontSize.size_sm,
        color: Color.brightGray,
        fontFamily: FontFamily.montserratLight,
        textAlign: "center",
        width: "90%",
    },
    verificationCallQuestions: {
        color: Color.brightGray,
        textDecorationLine: "underline",
        fontSize: FontSize.size_sm,
        marginBottom: 60,
        paddingHorizontal: 10, // @dev To increase "clickable size" for link
        fontFamily: FontFamily.montserratLight,
    },
    verificationInProgress: {
        color: Color.white,
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "center",
        marginBottom: 20,
    },
});

export default WaitingForVerification;
