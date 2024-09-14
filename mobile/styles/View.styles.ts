import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { Dimensions, Platform } from "react-native";
import styled from "styled-components/native";

export const TermsContainerOuter = styled.View`
    margin-bottom: 25px;
    min-height: 81px;
    letter-spacing: 0;
    color: ${Color.white};
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 24px;
    width: 88%;
    height: 45px;
`;

export const TermsText = styled.Text`
    font-family: ${FontFamily.montserratLight};
    font-weight: 500;
    font-size: ${FontSize.size_sm}px;
    text-shadow-color: rgba(0, 0, 0, 0.25);
    text-shadow-offset: 0px 4px;
    color: ${Color.white};
    line-height: 20px;
    text-shadow-radius: 4px;
    text-align: center;
`;

export const TermsLink = styled.Text`
    text-decoration-line: underline;
`;

export const Container = styled.View`
    width: 100%;
    align-items: center;
`;

export const PageContainer = styled.View`
    flex: 1;
    background-color: #fff;
    padding: 18px;
    width: 100%;
`;

export const ButtonContainer = styled.View`
    align-items: center;
    width: 100%;
    margin-top: auto;
    ${Platform.OS === "ios" && `margin-bottom: 10px;`}
`;

export const IconContainer = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
    z-index: -1;
`;

export const SplashContainerView = styled.View`
    flex-direction: column;
    align-items: center;
    flex: 1;
    margin-top: 334px;
`;

const { width, height } = Dimensions.get("window");
const aspectRatio = height / width;

export const AuthContainer = styled.View`
    width: 100%;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: ${Platform.OS === "ios" ? "8%" : "5%"};
`;

export const WelcomeButtonContainer = styled.View`
    width: 100%;
    padding-horizontal: 5%;
    margin-top: ${aspectRatio > 1.6 ? "5%" : "2%"};
`;

export const Content = styled.View`
    align-items: center;
    width: 100%;
`;

export const ErrorMessage = styled.Text`
    color: ${Color.lightOrange};
    font-size: ${FontSize.size_sm}px;
    font-family: ${FontFamily.montserratSemiBold};
    text-align: center;
    margin-bottom: ${height * 0.01}px;
`;

export const RuleItemContainer = styled.View`
    flex-direction: row;
    margin-bottom: 25px;
`;

export const RuleTextContainer = styled.View`
    flex: 1;
`;

export const ViolatingRulesTextView = styled.View`
    margin-top: 16px;
`;
