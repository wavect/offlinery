import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { ROUTES } from "../routes";
import {
    DEFAULT_FROM_TIME,
    DEFAULT_TO_TIME,
    EACTION_USER,
    getPublicProfileFromUserData, ImageIdx,
    useUserContext
} from "../../context/UserContext";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {Subtitle} from "../../GlobalStyles";
import OEncounter from "../../components/OEncounter/OEncounter";
import OTeaserProfilePreview from "../../components/OTeaserProfilePreview/OTeaserProfilePreview";
import {UserApi, UserControllerCreateUserRequest} from "../../api/gen/src";
import * as ImagePicker from "expo-image-picker";

const MAX_LENGTH_BIO = 60
const BioLetThemKnow = ({ navigation }) => {
    const { state, dispatch } = useUserContext();

    const setBio = (bio: string) => {
        if (bio.length > MAX_LENGTH_BIO) return;
        dispatch({ type: EACTION_USER.SET_BIO, payload: bio})
    }

    const registerUser = async () => {
        const api = new UserApi();

        // Prepare the user data
        const userData = {
            firstName: state.firstName,
            email: state.email,
            wantsEmailUpdates: state.wantsEmailUpdates,
            birthDay: state.birthDay.toISOString(),
            gender: state.gender,
            genderDesire: state.genderDesire,
            verificationStatus: state.verificationStatus,
            approachChoice: state.approachChoice,
            blacklistedRegions: state.blacklistedRegions,
            approachFromTime: state.approachFromTime.toISOString(),
            approachToTime: state.approachToTime.toISOString(),
            bio: state.bio,
            dateMode: state.dateMode,
        };

        // Prepare the images
        const images: Blob[] = [];
        for (const key in state.images) {
            const image: ImagePicker.ImagePickerAsset|undefined = state.images[key as ImageIdx];
            if (image) {
                const response = await fetch(image.uri);
                const blob = await response.blob();
                images.push(blob);
            }
        }

        const requestParameters: UserControllerCreateUserRequest = {
            user: userData,
            images: images,
        };

        try {
            const user = await api.userControllerCreateUser(requestParameters);
            console.log("User created successfully:", user);

            // Update the user state with the returned ID
            if (user.id) {
                dispatch({ type: EACTION_USER.SET_ID, payload: user.id });
            }

            // Navigate to the next screen or update the UI as needed
            navigation.navigate(ROUTES.MainTabView);
        } catch (error) {
            console.error("Error creating user:", error);
            // Handle the error (e.g., show an error message to the user)
        }
    };

    return (
        <OPageContainer
            title="Let them know"
            subtitle="The message is shown to the person approaching you before."
            bottomContainerChildren={
                <OButtonWide
                    text="Done"
                    filled={true}
                    variant="dark"
                    onPress={() => navigation.navigate(ROUTES.MainTabView)}
                />
            }
        >
            <View style={styles.inputContainer}>
                <OTextInput
                    value={state.bio}
                    setValue={setBio}
                    placeholder="No pick-up lines please. Just be chill."
                />
                <View style={styles.characterCountContainer}>
                    <Text style={styles.characterCount}>{MAX_LENGTH_BIO - state.bio.length}</Text>
                </View>
            </View>

            <OTeaserProfilePreview prefixText='Find ' publicProfile={getPublicProfileFromUserData(state)} showOpenProfileButton={false}/>
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