import React, { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  Text,
  TouchableOpacity,
} from "react-native";
import { BorderRadius, Color, FontFamily, FontSize } from "../../GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";

interface IOTextInputWideProps {
  value: string;
  setValue: React.Dispatch<string>;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  multiline?: boolean;
  topLabel?: string;
  bottomLabel?: string;
  isBottomLabelError?: boolean;
  secureTextEntry?: boolean;
}

export const OTextInputWide = (props: IOTextInputWideProps) => {
  const {
    secureTextEntry,
    isBottomLabelError,
    value,
    setValue,
    placeholder,
    style,
    multiline,
    topLabel,
    bottomLabel,
  } = props;

  const [isSecureTextVisible, setIsSecureTextVisible] =
    useState(!secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecureTextVisible(!isSecureTextVisible);
  };

  return (
    <View style={styles.container}>
      {topLabel && <Text style={styles.topLabel}>{topLabel}</Text>}
      <View style={[styles.inputContainer, style]}>
        <TextInput
          style={styles.input}
          value={value}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          onChangeText={setValue}
          placeholder={placeholder}
          multiline={multiline}
          placeholderTextColor={Color.white}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
            <MaterialIcons
              name={isSecureTextVisible ? "visibility" : "visibility-off"}
              size={24}
              color={Color.white}
            />
          </TouchableOpacity>
        )}
      </View>
      {bottomLabel && (
        <Text
          style={[
            styles.bottomLabel,
            isBottomLabelError ? styles.bottomLabelError : null,
          ]}
        >
          {bottomLabel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignItems: "center",
  },
  topLabel: {
    color: Color.white,
    fontSize: FontSize.size_sm,
    fontFamily: FontFamily.montserratSemiBold,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  bottomLabel: {
    color: Color.white,
    fontSize: FontSize.size_sm,
    fontFamily: FontFamily.montserratRegular,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  bottomLabelError: {
    color: Color.red,
    fontFamily: FontFamily.montserratSemiBold,
  },
  input: {
    flex: 1,
    lineHeight: 28,
    fontSize: FontSize.size_xl,
    fontFamily: FontFamily.montserratLight,
    fontWeight: "500",
    padding: 6,
    color: Color.white,
  },
  eyeIcon: {
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 65,
    borderRadius: BorderRadius.br_5xs,
    overflow: "hidden",
    backgroundColor: Color.stateLayersSurfaceDimOpacity08,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: Color.white,
    // Add shadow properties
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
});
