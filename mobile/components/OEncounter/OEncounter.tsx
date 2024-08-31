import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { EncounterStatusEnum } from "@/api/gen/src";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import * as React from "react";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface ISingleEncounterProps {
    encounterProfile: IEncounterProfile;
    showActions: boolean;
    navigation: any;
}

const OEncounter = (props: ISingleEncounterProps) => {
    const { dispatch } = useEncountersContext();
    const { encounterProfile, showActions, navigation } = props;
    const { personalRelationship } = encounterProfile;
    const [dateStates] = useState([
        {
            label: i18n.t(TR.encounterInterest.notMet),
            value: EncounterStatusEnum.not_met,
        },
        {
            label: i18n.t(TR.encounterInterest.metNotInterested),
            value: EncounterStatusEnum.met_not_interested,
        },
        {
            label: i18n.t(TR.encounterInterest.metInterested),
            value: EncounterStatusEnum.met_interested,
        },
    ]);

    const setDateStatus = (item: {
        label: string;
        value: EncounterStatusEnum;
    }) => {
        dispatch({
            type: EACTION_ENCOUNTERS.SET_DATE_STATUS,
            payload: {
                encounterId: encounterProfile.encounterId,
                value: item.value,
            },
        });
    };
    const dateStatus = encounterProfile.personalRelationship?.status;

    return (
        <View style={styles.encounterContainer}>
            <Image
                style={styles.profileImage}
                contentFit="cover"
                source={{ uri: encounterProfile.imageURIs[0] }}
            />
            <View style={styles.encounterDetails}>
                <Text
                    style={styles.nameAge}
                >{`${encounterProfile.firstName}, ${encounterProfile.age}`}</Text>
                <Text
                    style={styles.encounterInfo}
                >{`${personalRelationship?.lastTimePassedBy} near ${personalRelationship?.lastLocationPassedBy}`}</Text>

                {showActions && (
                    <View style={styles.encounterDropdownContainer}>
                        <Dropdown
                            data={dateStates}
                            labelField="label"
                            valueField="value"
                            value={dateStatus}
                            onChange={setDateStatus}
                            disable={personalRelationship?.reported}
                            containerStyle={styles.dropdownContainerStyle}
                            style={[
                                styles.encounterDropdownPicker,
                                personalRelationship?.reported
                                    ? styles.encounterDropdownPickerDisabled
                                    : null,
                            ]}
                            placeholderStyle={styles.dropdownPlaceholderStyle}
                            selectedTextStyle={styles.dropdownSelectedTextStyle}
                            itemTextStyle={styles.dropdownItemTextStyle}
                        />
                    </View>
                )}
            </View>
            {showActions && (
                <View style={styles.rightColumn}>
                    <Text
                        style={styles.trustScore}
                        onPress={() => alert(i18n.t(TR.ratingDescr))}
                    >
                        {i18n.t(TR.trust)}({encounterProfile.rating})
                    </Text>
                    {dateStatus === EncounterStatusEnum.met_not_interested && (
                        <Pressable
                            style={
                                personalRelationship?.reported
                                    ? styles.buttonDisabled
                                    : styles.buttonDanger
                            }
                            disabled={personalRelationship?.reported}
                            onPress={() =>
                                navigation.navigate(
                                    ROUTES.Main.ReportEncounter,
                                    {
                                        personToReport: encounterProfile,
                                    },
                                )
                            }
                        >
                            <Text style={styles.buttonText}>
                                {personalRelationship?.reported
                                    ? i18n.t(TR.reported)
                                    : i18n.t(TR.report)}
                            </Text>
                        </Pressable>
                    )}

                    {dateStatus === EncounterStatusEnum.not_met &&
                        personalRelationship?.isNearbyRightNow && (
                            <Pressable
                                style={styles.buttonBlack}
                                onPress={() =>
                                    navigation.navigate(ROUTES.HouseRules, {
                                        nextPage:
                                            ROUTES.Main.NavigateToApproach,
                                        propsForNextScreen: {
                                            navigateToPerson: encounterProfile,
                                        },
                                    })
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {i18n.t(TR.navigate)}
                                </Text>
                            </Pressable>
                        )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    encounterContainer: {
        flexDirection: "row",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Color.lightGray,
        paddingBottom: 10,
        zIndex: 1,
        elevation: 1,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    encounterDetails: {
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
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    trustScore: {
        fontFamily: FontFamily.montserratSemiBold,
    },
    buttonBlack: {
        backgroundColor: Color.black,
        borderColor: Color.gray,
        borderWidth: 1,
        borderRadius: 8,
        padding: 7,
        marginLeft: 5,
    },
    buttonDanger: {
        backgroundColor: Color.red,
        borderColor: "#c00f0c",
        borderWidth: 1,
        borderRadius: 8,
        padding: 7,
        marginLeft: 5,
    },
    buttonDisabled: {
        borderRadius: 8,
        padding: 7,
        backgroundColor: Color.lightGray,
        borderColor: Color.gray,
        color: Color.white,
        borderWidth: 1,
        marginLeft: 5,
    },
    buttonText: {
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
    encounterDropwdownContainer: {
        zIndex: 3000,
    },
    encounterDropdownContainer: {
        marginTop: 5,
    },
    dropdownContainerStyle: {
        backgroundColor: "white",
        borderRadius: 8,
    },
    encounterDropdownPicker: {
        height: 35,
        borderColor: Color.lightGray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    encounterDropdownPickerDisabled: {
        backgroundColor: Color.brightGray,
    },
    dropdownPlaceholderStyle: {
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
    },
    dropdownSelectedTextStyle: {
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
    },
    dropdownItemTextStyle: {
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
    },
});

export default OEncounter;
