import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserApi, UserVerificationStatusEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OShowcase } from "@/components/OShowcase/OShowcase";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { refreshUserData } from "@/services/auth.service";
import { SText } from "@/styles/Text.styles";
import { SUPPORT_MAIL } from "@/utils/general.constants";
import { A } from "@expo/html-elements";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const userApi = new UserApi();
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
        const updatedUser = await userApi.userControllerGetOwnUserData({
            userId: state.id!,
        });
        refreshUserData(dispatch, updatedUser);
    };

    return (
        <OPageColorContainer refreshFunc={reloadUserState}>
            <View style={styles.layoutContainer}>
                <OShowcase subtitle={i18n.t(TR.stopSwipingMeetIrl)} />

                <OButtonWide
                    filled={true}
                    text={i18n.t(
                        state.verificationStatus ===
                            UserVerificationStatusEnum.verified
                            ? TR.verificationInProgress
                            : TR.verificationSuccessful,
                    )}
                    disabled={
                        state.verificationStatus !==
                        UserVerificationStatusEnum.verified
                    }
                    onPress={() => navigation.navigate(ROUTES.MainTabView)}
                    variant="light"
                />

                <OButtonWide
                    filled={false}
                    text={i18n.t(TR.bookNewCall)}
                    variant="light"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.BookSafetyCall)
                    }
                />
                <SText.Subtitle>
                    {i18n.t(TR.pleaseDoNotMakeDoubleBookings)}
                </SText.Subtitle>

                <A href={`mailto:${SUPPORT_MAIL}`} style={styles.bottomText}>
                    {i18n.t(TR.somethingWrongQ)}
                </A>
            </View>
        </OPageColorContainer>
    );
};

const styles = StyleSheet.create({
    subtitleBookCall: {
        fontSize: FontSize.size_md,
        color: Color.white,
        marginBottom: 80,
    },
    bottomTextContainer: {
        display: "flex",
        letterSpacing: 0,
        color: Color.white,
        textAlign: "center",
        alignItems: "center",
    },
    bottomText: {
        display: "flex",
        fontWeight: "500",
        justifyContent: "center",
    },
    termsText: {
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
    },
    termsLink: {
        textDecorationLine: "underline",
        fontFamily: FontFamily.montserratRegular,
    },
});

export default WaitingForVerification;
