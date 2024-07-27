import * as React from "react";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import * as ImagePicker from 'expo-image-picker';
import {View, Image, StyleSheet, Pressable} from "react-native";
import {BorderRadius, Color} from "../../GlobalStyles";
import {EACTION_USER, ImageIdx, IUserAction, IUserData, useUserContext} from "../../context/UserContext";
import { MaterialIcons } from '@expo/vector-icons';

interface IPhotoContainerProps {
    imageIdx: ImageIdx
    dispatch: React.Dispatch<IUserAction>
    state: IUserData,
}
const PhotoContainer = (props: IPhotoContainerProps) => {
    const {dispatch, imageIdx, state} = props

    const openMediaLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            allowsMultipleSelection: false,
        });

        if (!result.canceled) {
            // remove, override, add image
            dispatch({type: EACTION_USER.SET_IMAGE, payload: {imageIdx, image: result.assets[0]}})
            //}
        } else {
            alert('You did not select any image.');
        }
    }

    const currImg = state.images[imageIdx]
    return (
        <Pressable style={styles.photoContainer} onPress={openMediaLibrary}>
            {currImg ? (
                <Image
                    style={styles.previewImage}
                    source={{ uri: currImg.uri }}
                />
            ) : (
                <MaterialIcons name="add-circle-outline" size={30} color={Color.primary}/>
            )}
        </Pressable>
    )
}

const AddPhotos = ({navigation}) => {
    //const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
    //const [mediaLibStatus, requestMediaLibPermission] = ImagePicker.useMediaLibraryPermissions();
    const {state, dispatch} = useUserContext();
    const hasAnyImage = Object.values(state.images).some(Boolean);

    return (
        <OPageContainer
            title="Add photos"
            bottomContainerChildren={
                <OButtonWide
                    text="Continue"
                    filled={true}
                    variant="dark"
                    disabled={!hasAnyImage}
                    onPress={() => navigation.navigate(ROUTES.HouseRules, {
                        nextPage: ROUTES.Onboarding.ApproachChoice
                    })}
                />
            }
            subtitle="Click to upload images."
        >
            <View style={styles.container}>
                <View style={styles.row}>
                    <PhotoContainer imageIdx="0" dispatch={dispatch} state={state} />
                    <PhotoContainer imageIdx="1" dispatch={dispatch} state={state}/>
                </View>
                <View style={styles.row}>
                    <PhotoContainer imageIdx="2" dispatch={dispatch} state={state}/>
                    <PhotoContainer imageIdx="3" dispatch={dispatch} state={state}/>
                </View>
                <View style={styles.row}>
                    <PhotoContainer imageIdx="4" dispatch={dispatch} state={state}/>
                    <PhotoContainer imageIdx="5" dispatch={dispatch} state={state}/>
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.br_5xs,
    },
    photoContainer: {
        width: 150,
        height: 150,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: BorderRadius.br_5xs,
        borderColor: Color.primary,
        borderStyle: "dashed",
        backgroundColor: Color.brightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusIcon: {
        width: 30,
        height: 30,
    },
});

export default AddPhotos;