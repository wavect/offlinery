import * as React from "react";
import { StyleSheet } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { ROUTES } from "../routes";
import { EACTION_USER, useUserContext } from "../../context/UserContext";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import { OTextInput } from "../../components/OTextInput/OTextInput";
import { OCheckbox } from "../../components/OCheckbox/OCheckbox";
import { i18n, TR } from "../../localization/translate.service";
import { RegistrationApi } from "../../api/gen/src";

const Email = ({ navigation }) => {
  const { state, dispatch } = useUserContext();

  const setEmail = (email: string) => {
    dispatch({ type: EACTION_USER.SET_EMAIL, payload: email });
  };
  const setCheckboxChecked = (wantsEmailUpdates: boolean) => {
    dispatch({
      type: EACTION_USER.SET_EMAIL_UPDATES,
      payload: wantsEmailUpdates,
    });
  };

  const isInvalidEmail = () =>
    !state.email?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

  const onContinue = async () => {
    try {
      const regApi = new RegistrationApi();
      const result =
        await regApi.registrationControllerRegisterUserForEmailVerification({
          registrationForVerificationDto: { email: state.email },
        });

      // Backend sent us an error
      if (!result.email) {
        console.error("Error registering email");
        return;
      }

      navigation.navigate(ROUTES.Onboarding.VerifyEmail);
    } catch (error) {console.error(error)}
  };

  return (
    <OPageContainer
      title={i18n.t(TR.whatIsYourEmail)}
      bottomContainerChildren={
        <OButtonWide
          text={i18n.t(TR.continue)}
          filled={true}
          disabled={isInvalidEmail()}
          variant="dark"
          onPress={onContinue}
        />
      }
      subtitle={i18n.t(TR.whatIsYourEmailDescr)}
    >
      <OTextInput
        value={state.email}
        setValue={setEmail}
        placeholder={i18n.t(TR.yourEmail)}
        style={styles.inputField}
      />

      <OCheckbox
        onValueChange={setCheckboxChecked}
        checkboxState={state.wantsEmailUpdates}
        label={i18n.t(TR.wantToReceiveNews)}
      />
    </OPageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
  },
  content: {
    flex: 1,
  },
  inputField: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
  },
});

export default Email;
