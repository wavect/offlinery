import * as React from "react";
import {useEffect, useState} from "react";
import {Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import MapView, {
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE
} from "react-native-maps";
import {BorderRadius, Color} from "../../GlobalStyles";
import {getPublicProfileFromUserData, useUserContext} from "../../context/UserContext";
import * as Location from 'expo-location';
import {LocationAccuracy} from 'expo-location';
import OTeaserProfilePreview from "../../components/OTeaserProfilePreview/OTeaserProfilePreview";
import {IEncounterProfile} from "../../types/PublicProfile.types";
import {getPublicProfileFromEncounter} from "../../context/EncountersContext";

const NavigateToApproach = ({route, navigation}) => {
  const {state, dispatch} = useUserContext()
  const navigateToPerson: IEncounterProfile = route.params?.navigateToPerson

  const [location, setLocation] = useState<Location.LocationObject|null>(null);
  const mapRef = React.useRef(null);
  const [mapRegion, setMapRegion] = useState({
    // Uni Ibk
    latitude: 47.257832302,
    longitude: 11.383665132,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // TODO: Provider Google should also work for IOS, but ONLY WITHOUT EXPO GO!
  // TODO: Maybe make map to a separate component
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({accuracy: LocationAccuracy.BestForNavigation});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  return (
      <OPageContainer>
        <>
          <OTeaserProfilePreview prefixText='Find ' publicProfile={getPublicProfileFromEncounter(navigateToPerson)} showOpenProfileButton={true} />
          <MapView
              ref={mapRef}
              style={styles.map}
              region={mapRegion}
              initialRegion={{
                latitude: location?.coords?.latitude ?? 47.257832302,
                longitude: location?.coords?.longitude ?? 11.383665132,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          >
          </MapView>
        </>
      </OPageContainer>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    minHeight: 400,
    borderRadius: BorderRadius.br_5xs,
  },
  removeButtonContainer: {
    position: 'absolute',
    top: 70,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    marginTop: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  instructionText: {
    marginBottom: 5,
  },
  sliderContainer: {
    marginTop: 20,
  },
  slider: {
    width: '100%',
  },
  sliderValue: {
    color: Color.white,
    textAlign: 'center',
  },
});

export default NavigateToApproach;