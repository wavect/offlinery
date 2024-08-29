import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  ViewStyle,
  View,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";
import * as React from "react";
import { Color, FontFamily, FontSize } from "../../GlobalStyles";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface IOTextInputProps {
  value: string;
  setValue: React.Dispatch<string>;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  multiline?: boolean;
  secureTextEntry?: boolean;
  topLabel?: string;
  bottomLabel?: string;
  isBottomLabelError?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

export const OTextInput = (props: IOTextInputProps) => {
  const {
    topLabel,
    bottomLabel,
    isBottomLabelError,
    secureTextEntry,
    value,
    setValue,
    placeholder,
    style,
    multiline,
    keyboardType,
    maxLength,
  } = props;
  const [isSecureTextVisible, setIsSecureTextVisible] =
    useState(!secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecureTextVisible(!isSecureTextVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {topLabel && <Text style={styles.topLabel}>{topLabel}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          multiline={multiline}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
            <MaterialIcons
              name={isSecureTextVisible ? "visibility" : "visibility-off"}
              size={24}
              color="#999"
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
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    width: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  container: {
    width: "90%",
    alignItems: "center",
  },
  topLabel: {
    color: Color.gray,
    fontSize: FontSize.size_sm,
    fontFamily: FontFamily.montserratSemiBold,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  bottomLabel: {
    color: Color.gray,
    fontSize: FontSize.size_sm,
    fontFamily: FontFamily.montserratRegular,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  bottomLabelError: {
    color: Color.red,
    fontFamily: FontFamily.montserratSemiBold,
  },
});
