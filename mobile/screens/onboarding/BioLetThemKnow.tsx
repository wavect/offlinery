import { Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserPrivateDTOApproachChoiceEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import OTeaserProfilePreview from "@/components/OTeaserProfilePreview/OTeaserProfilePreview";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import {
    EACTION_USER,
    getPublicProfileFromUserData,
    registerUser,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { CommonActions } from "@react-navigation/native";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const MAX_LENGTH_BIO = 60;
const BioLetThemKnow = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.BioLetThemKnow
>) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);

    const setBio = (bio: string) => {
        if (bio.length > MAX_LENGTH_BIO) return;
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { bio } });
    };

    const startUserRegistration = async () => {
        setLoading(true);
        // @dev Navigate to main tab screen but clear previous stack
        const onSuccess = () =>
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: ROUTES.MainTabView }],
                }),
            );
        const onFailure = (err: any) => console.error(err); // TODO
        try {
            await registerUser(state, dispatch, onSuccess, onFailure);
        } finally {
            setLoading(false);
            /** @dev Delete clear password once logged in */
            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { clearPassword: "" },
            });
        }
    };

    const needsToCompleteOtherFlowToo =
        state.approachChoice === UserPrivateDTOApproachChoiceEnum.both;

    // @dev ApproachChoice.BOTH, also other approaching flow needs to be done
    const continueToOtherFlow = () => {
        navigation.navigate(ROUTES.Onboarding.SafetyCheck);
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.messageShownToPersonApproaching)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(
                        needsToCompleteOtherFlowToo ? TR.continue : TR.done,
                    )}
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.registering)}
                    filled={true}
                    variant="dark"
                    onPress={
                        needsToCompleteOtherFlowToo
                            ? continueToOtherFlow
                            : startUserRegistration
                    }
                />
            }
        >
            <View style={styles.inputContainer}>
                <OTextInput
                    value={state.bio}
                    onChangeText={setBio}
                    containerStyle={styles.input}
                    placeholder={i18n.t(TR.noPickUpLinesBeChill)}
                    showCharacterCount
                    maxLength={MAX_LENGTH_BIO}
                />
            </View>

            <OTeaserProfilePreview
                prefixText={i18n.t(TR.findWithSpace)}
                navigation={navigation}
                publicProfile={getPublicProfileFromUserData(state)}
                showOpenProfileButton={false}
            />
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    subtitleContainer: {
        alignItems: "flex-end",
        marginBottom: 16,
    },
    subtitle: {
        ...(Subtitle as ViewStyle),
        textAlign: "right",
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        width: "100%",
    },
    characterCountContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8,
    },
});

export default BioLetThemKnow;
