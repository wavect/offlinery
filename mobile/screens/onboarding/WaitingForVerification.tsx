import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserApi } from "@/api/gen/src";
import { UserVerificationStatusEnum } from "@/api/gen/src/models/User";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { refreshUserData } from "@/services/auth.service";
import { SUPPORT_MAIL } from "@/utils/general.constants";
import { includeJWT } from "@/utils/misc.utils";
import { A } from "@expo/html-elements";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
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
        const updatedUser = await userApi.userControllerGetOwnUserData(
            {
                userId: state.id!,
            },
            await includeJWT(),
        );
        refreshUserData(dispatch, updatedUser);
    };

    return (
        <OPageColorContainer refreshFunc={reloadUserState}>
            <View style={styles.btnContainer}>
                <OButtonWide
                    filled={true}
                    text={i18n.t(
                        state.verificationStatus !==
                            UserVerificationStatusEnum.verified
                            ? TR.verificationInProgress
                            : TR.verificationSuccessful,
                    )}
                    disabled={
                        state.verificationStatus !==
                        UserVerificationStatusEnum.verified
                    }
                    style={styles.btn}
                    onPress={() => navigation.navigate(ROUTES.MainTabView)}
                    variant="light"
                />

                {state.verificationStatus !==
                    UserVerificationStatusEnum.verified && (
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

            <A href={`mailto:${SUPPORT_MAIL}`} style={styles.bottomText}>
                {i18n.t(TR.somethingWrongQ)}
            </A>
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
        fontSize: FontSize.size_md,
        color: Color.brightGray,
    },
    bottomText: {
        display: "flex",
        color: Color.brightGray,
        fontSize: FontSize.size_md,
        textDecorationLine: "underline",
        fontFamily: FontFamily.montserratRegular,
    },
});

export default WaitingForVerification;
