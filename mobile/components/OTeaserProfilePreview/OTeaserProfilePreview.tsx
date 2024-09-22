import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { UserPublicDTO } from "@/api/gen/src";
import { ROUTES } from "@/screens/routes";
import * as React from "react";
import {
    Image,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { GestureResponderEvent } from "react-native/Libraries/Types/CoreEventTypes";

interface IOTeaserProfileProps {
    prefixText?: string;
    publicProfile: Omit<UserPublicDTO, "id">;
    showOpenProfileButton: boolean;
    secondButton?: {
        onPress: (event: GestureResponderEvent) => void;
        disabled?: boolean;
        text: string;
        style?: StyleProp<ViewStyle>;
    };
    navigation?: any;
}

/** @dev This component looks a bit differently to the OEncounter component and does not require the EncountersContext */
const OTeaserProfilePreview = (props: IOTeaserProfileProps) => {
    const {
        navigation,
        secondButton,
        publicProfile,
        showOpenProfileButton,
        prefixText,
    } = props;

    return (
        <View style={styles.outerContainer}>
            <View style={styles.profileContainer}>
                <Image
                    style={styles.profileImage}
                    contentFit="cover"
                    source={{ uri: publicProfile.imageURIs[0] }}
                />
                <View style={styles.profileDetails}>
                    <Text
                        style={styles.nameAge}
                    >{`${prefixText ?? ""}${publicProfile.firstName}, ${publicProfile.age}`}</Text>
                    <Text style={styles.encounterInfo}>
                        {publicProfile.bio}
                    </Text>

                    {showOpenProfileButton && (
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={styles.button}
                                onPress={() =>
                                    navigation.navigate(
                                        ROUTES.Main.ProfileView,
                                        {
                                            user: publicProfile,
                                        },
                                    )
                                }
                            >
                                <Text style={styles.buttonText}>Profile</Text>
                            </Pressable>
                            {secondButton && (
                                <Pressable
                                    style={[styles.button, secondButton.style]}
                                    onPress={secondButton.onPress}
                                    disabled={secondButton.disabled}
                                >
                                    <Text style={styles.buttonText}>
                                        {secondButton.text}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    profileContainer: {
        flexDirection: "row",
    },
    outerContainer: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Color.lightGray,
        paddingBottom: 10,
        zIndex: 1,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileDetails: {
        flex: 1,
        marginLeft: 15,
        zIndex: 2,
    },
    nameAge: {
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratMedium,
        marginBottom: 5,
    },
    encounterInfo: {
        fontFamily: FontFamily.montserratRegular,
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 5,
    },
    button: {
        marginRight: 10,
        backgroundColor: Color.black,
        borderColor: Color.gray,
        color: Color.white,
        borderWidth: 1,
        borderRadius: 8,
        padding: 7,
    },
    buttonText: {
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
});

export default OTeaserProfilePreview;
