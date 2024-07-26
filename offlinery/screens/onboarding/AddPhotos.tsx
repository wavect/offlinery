import * as React from "react";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import * as ImagePicker from 'expo-image-picker';
import {View, Image, StyleSheet, Pressable} from "react-native";
import {BorderRadius, Color, FontFamily, Padding} from "../../GlobalStyles";
import {useState} from "react";

interface IPhotoContainerProps {
    setImages: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerSuccessResult[]>>
}

const PhotoContainer = (props: IPhotoContainerProps) => {
    const openMediaLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImages()
        } else {
            alert('You did not select any image.');
        }
    }

    return <Pressable style={styles.photoContainer} onPress={openMediaLibrary}>
        <Image
            style={styles.plusIcon}
            contentFit="cover"
            source={require("../../assets/img/plus-circle.svg")}
        />
    </Pressable>
}

const AddPhotos = ({navigation}) => {
    //const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
    //const [mediaLibStatus, requestMediaLibPermission] = ImagePicker.useMediaLibraryPermissions();
    const [images, setImages] = useState<ImagePicker.ImagePickerSuccessResult[]>([])

    return (
        <OPageContainer
            title="Add photos"
            bottomContainerChildren={
                <OButtonWide
                    text="Continue"
                    filled={true}
                    variant="dark"
                    onPress={() => navigation.navigate(ROUTES.HouseRules, {
                        nextPage: ROUTES.Onboarding.ApproachChoice
                    })}
                />
            }
            subtitle="Click to upload images."
        >
            <View style={styles.container}>
                <View style={styles.row}>
                    <PhotoContainer/>
                    <PhotoContainer/>
                </View>
                <View style={styles.row}>
                    <PhotoContainer/>
                    <PhotoContainer/>
                </View>
                <View style={styles.row}>
                    <PhotoContainer/>
                    <PhotoContainer/>
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