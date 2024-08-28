import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { Color, Subtitle } from "../../GlobalStyles";
import { ROUTES } from "../routes";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import {
  EACTION_USER,
  EApproachChoice,
  EVerificationStatus,
  useUserContext,
} from "../../context/UserContext";
import { i18n, TR } from "../../localization/translate.service";

const ApproachChoice = ({ navigation }) => {
  const { dispatch } = useUserContext();

  const setApproachChoice = (approachChoice: EApproachChoice) => {
    dispatch({
      type: EACTION_USER.SET_APPROACH_CHOICE,
      payload: approachChoice,
    });

    switch (approachChoice) {
      case EApproachChoice.APPROACH: // fall through
        dispatch({
          type: EACTION_USER.SET_VERIFICATION_STATUS,
          payload: EVerificationStatus.PENDING,
        });
        navigation.navigate(ROUTES.Onboarding.SafetyCheck);
        break;
      case EApproachChoice.BE_APPROACHED:
        dispatch({
          type: EACTION_USER.SET_VERIFICATION_STATUS,
          payload: EVerificationStatus.NOT_NEEDED,
        });
        navigation.navigate(ROUTES.Onboarding.DontApproachMeHere); // not doing IliveHere for now, to avoid geoFencing their address
        break;
      case EApproachChoice.BOTH:
      // TODO: Not yet supported, since both flows need to be completed
    }
  };

  return (
    <OPageContainer
      title={i18n.t(TR.iWantTo)}
      bottomContainerChildren={
        <Text style={styles.footnote}>
          No worries, you can change this at any time.
        </Text>
      }
    >
      <View style={styles.optionContainer}>
        <OButtonWide
          text={i18n.t(TR.approach)}
          filled={true}
          variant="dark"
          onPress={() => setApproachChoice(EApproachChoice.APPROACH)}
        />
        <Text style={[Subtitle, styles.subtitle]}>
          {i18n.t(TR.approachDescr)}
        </Text>
      </View>

      <View style={styles.optionContainer}>
        <OButtonWide
          text={i18n.t(TR.beApproached)}
          filled={true}
          variant="dark"
          onPress={() => setApproachChoice(EApproachChoice.BE_APPROACHED)}
        />
        <Text style={[Subtitle, styles.subtitle]}>
          {i18n.t(TR.beApproachedDescr)}
        </Text>
      </View>

      <View style={styles.optionContainer}>
        <OButtonWide
          text={i18n.t(TR.both)}
          filled={false}
          variant="dark"
          disabled={true}
          onPress={() => setApproachChoice(EApproachChoice.BOTH)}
        />
        <Text style={[Subtitle, styles.subtitle]}>{i18n.t(TR.bothDescr)}</Text>
      </View>
    </OPageContainer>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    alignItems: "center",
    marginTop: 40,
    width: "100%",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  footnote: {
    textAlign: "center",
    color: Color.lightGray,
    fontSize: 14,
    marginTop: 20,
  },
});

export default ApproachChoice;
