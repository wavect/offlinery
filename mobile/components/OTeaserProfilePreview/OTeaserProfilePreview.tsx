import {IPublicProfile} from "../../types/PublicProfile.types";
import * as React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";


interface IOTeaserProfileProps {
    prefixText?: string
    publicProfile: IPublicProfile
    showOpenProfileButton: boolean
}

/** @dev This component looks a bit differently to the OEncounter component and does not require the EncountersContext */
const OTeaserProfilePreview = (props: IOTeaserProfileProps) => {
    const {publicProfile, showOpenProfileButton, prefixText} = props;

    return <View style={styles.profileContainer}>
        <Image
            style={styles.profileImage}
            contentFit="cover"
            source={{uri: publicProfile.mainImageURI}}
        />
        <View style={styles.profileDetails}>
            <Text style={styles.nameAge}>{`${prefixText ?? ''}${publicProfile.firstName}, ${publicProfile.age}`}</Text>
            <Text
                style={styles.encounterInfo}>{publicProfile.bio}</Text>

        </View>
        {showOpenProfileButton && <View style={styles.rightColumn}>
                <Pressable style={styles.button}>
                    {/* TODO: onPress={() => navigation.navigate(ROUTES.Main.ReportEncounter, {personToReport: publicProfile})}>*/}
                    <Text style={styles.buttonText}>
                       View Profile
                    </Text>
                </Pressable>
        </View>}
    </View>
}

const styles = StyleSheet.create({
    profileContainer: {
        flexDirection: 'row',
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
        marginBottom: 10,
    },
    rightColumn: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    button: {
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

export default OTeaserProfilePreview