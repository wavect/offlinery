import { MainStackParamList } from "@/MainStack.navigator";
import { UserPrivateDTOIntentionsEnum } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/services/storage.service";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const IntentionChoice = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.IntentionsChoice
>) => {
    const { state, dispatch } = useUserContext();
    const [selectedIntentions, setSelectedIntentions] = React.useState<
        UserPrivateDTOIntentionsEnum[]
    >([]);

    const toggleIntention = (intention: UserPrivateDTOIntentionsEnum) => {
        setSelectedIntentions((prev) =>
            prev.includes(intention)
                ? prev.filter((g) => g !== intention)
                : [...prev, intention],
        );
    };

    const isSelected = (intention: UserPrivateDTOIntentionsEnum) =>
        selectedIntentions.includes(intention);

    const onContinue = () => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { intentions: selectedIntentions },
        });
        navigation.navigate(ROUTES.Onboarding.GenderLookingFor);
    };

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    return (
        <OPageContainer
            fullpageIcon="info"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    onPress={onContinue}
                    variant={"dark"}
                    disabled={selectedIntentions.length === 0}
                />
            }
        >
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.relationship)}
                    filled={isSelected(
                        UserPrivateDTOIntentionsEnum.relationship,
                    )}
                    variant="dark"
                    onPress={() => toggleIntention("relationship")}
                />
            </View>
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.casual)}
                    filled={isSelected(UserPrivateDTOIntentionsEnum.casual)}
                    variant="dark"
                    onPress={() => toggleIntention("casual")}
                />
            </View>
            <View style={styles.optionContainer}>
                <OButtonWide
                    text={i18n.t(TR.friendship)}
                    filled={isSelected(UserPrivateDTOIntentionsEnum.friendship)}
                    variant="dark"
                    onPress={() => toggleIntention("friendship")}
                />
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    optionContainer: {
        alignItems: "center",
        marginTop: 20,
        width: "100%",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default IntentionChoice;
