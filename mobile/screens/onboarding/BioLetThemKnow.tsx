import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { ROUTES } from "../routes";
import {
    EACTION_USER,
    getPublicProfileFromUserData, ImageIdx, registerUser,
    useUserContext
} from "../../context/UserContext";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {Subtitle} from "../../GlobalStyles";
import OTeaserProfilePreview from "../../components/OTeaserProfilePreview/OTeaserProfilePreview";
import {useState} from "react";
import {i18n, TR} from "../../localization/translate.service";

const MAX_LENGTH_BIO = 60
const BioLetThemKnow = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false)

    const setBio = (bio: string) => {
        if (bio.length > MAX_LENGTH_BIO) return;
        dispatch({ type: EACTION_USER.SET_BIO, payload: bio})
    }

    const startUserRegistration = async () => {
        setLoading(true)
        const onSuccess = () => navigation.navigate(ROUTES.MainTabView)
        const onFailure = (err: any) => console.error(err) // TODO
        try {
            await registerUser(state, dispatch, onSuccess, onFailure)
        } finally {
            setLoading(false)
            /** @dev Delete clear password once logged in */
            dispatch({type: EACTION_USER.SET_CLEAR_PASSWORD, payload: ""})
        }
    }

    return (
        <OPageContainer
            title={i18n.t(TR.letThemKnow)}
            subtitle={i18n.t(TR.messageShownToPersonApproaching)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.done)}
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.registering)}
                    filled={true}
                    variant="dark"
                    onPress={startUserRegistration}
                />
            }
        >
            <View style={styles.inputContainer}>
                <OTextInput
                    value={state.bio}
                    setValue={setBio}
                    placeholder={i18n.t(TR.noPickUpLinesBeChill)}
                />
                <View style={styles.characterCountContainer}>
                    <Text style={styles.characterCount}>{MAX_LENGTH_BIO - state.bio.length}</Text>
                </View>
            </View>

            <OTeaserProfilePreview prefixText={i18n.t(TR.findWithSpace)} navigation={navigation}
                                   publicProfile={getPublicProfileFromUserData(state)} showOpenProfileButton={false}/>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    subtitleContainer: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    subtitle: {
        ...Subtitle,
        textAlign: 'right',
    },
    inputContainer: {
        marginBottom: 16,
    },
    characterCountContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    characterCount: {
        ...Subtitle,
    },
});

export default BioLetThemKnow;