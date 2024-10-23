import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { PhotoContainer } from "@/components/OPhotoContainer/OPhotoContainer";
import { ImageIdx, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { API } from "@/utils/api-config";
import { isImagePicker } from "@/utils/media.utils";
import {
    openAppSettings,
    saveOnboardingState,
    showOpenAppSettingsAlert,
} from "@/utils/misc.utils";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const AddPhotos = ({
    route,
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.AddPhotos
>) => {
    const [mediaLibStatus, requestMediaLibPermission] =
        ImagePicker.useMediaLibraryPermissions();
    const [isLoading, setLoading] = useState(false);
    const { state, dispatch } = useUserContext();
    const hasAnyImage = Object.values(state.imageURIs).some(Boolean);

    const { width } = useWindowDimensions();
    const openSettings = async () => {
        if (!route.params?.overrideOnBtnPress) {
            saveOnboardingState(state, navigation.getState());
        }

        await openAppSettings();
    };
    React.useEffect(() => {
        if (
            mediaLibStatus &&
            !mediaLibStatus?.granted &&
            !mediaLibStatus?.canAskAgain
        ) {
            showOpenAppSettingsAlert(
                i18n.t(TR.pleaseChangePermission),
                openSettings,
            );
        }
    }, [mediaLibStatus]);

    // Calculate the size of each photo container based on screen width
    const containerPadding = 20;
    const gapBetweenContainers = 10;
    const photoContainerSize =
        (width - 2 * containerPadding - gapBetweenContainers) / 2;

    const onSave = async () => {
        if (route.params?.overrideOnBtnPress) {
            setLoading(true);
            try {
                await API.user.userControllerUpdateUser({
                    userId: state.id!,
                    ...(() => {
                        const images: (
                            | ImagePicker.ImagePickerAsset
                            | undefined
                        )[] = [];
                        const indexImagesToDelete: number[] = [];

                        (["0", "1", "2", "3", "4", "5"] as ImageIdx[]).forEach(
                            (idx) => {
                                const img = state.imageURIs[idx];
                                if (isImagePicker(img)) {
                                    images[Number(idx)] = img;
                                } else if (img === null) {
                                    indexImagesToDelete.push(Number(idx));
                                } else {
                                    images[Number(idx)] = undefined;
                                }
                            },
                        );

                        return {
                            images,
                            updateUserDTO: { indexImagesToDelete },
                        };
                    })(),
                });
                route.params.overrideOnBtnPress();
            } catch (err) {
                throw err;
            } finally {
                setLoading(false);
            }
        } else {
            // @dev Saved on account creation
            navigation.navigate(ROUTES.HouseRules, {
                nextPage: ROUTES.Onboarding.ApproachChoice,
            });
        }
    };

    return (
        <OPageContainer
            bottomContainerChildren={
                <OButtonWide
                    text={
                        route.params?.overrideSaveBtnLbl || i18n.t(TR.continue)
                    }
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.updating)}
                    filled={true}
                    variant="dark"
                    disabled={!hasAnyImage}
                    onPress={onSave}
                />
            }
            subtitle={i18n.t(TR.clickToUploadImages)}
        >
            <View style={styles.container}>
                {[
                    ["0", "1"],
                    ["2", "3"],
                    ["4", "5"],
                ].map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((idx) => (
                            <PhotoContainer
                                key={idx}
                                imageIdx={idx as ImageIdx}
                                dispatch={dispatch}
                                state={state}
                                mediaStatus={mediaLibStatus}
                                requestMediaLibPermission={
                                    requestMediaLibPermission
                                }
                                size={photoContainerSize}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
});

export default AddPhotos;
