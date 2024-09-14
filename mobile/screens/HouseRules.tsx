import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { StyledMaterialIcon } from "@/styles/Icon.styles";
import { StyledText } from "@/styles/Text.styles";
import {
    ButtonContainer,
    RuleItemContainer,
    RuleTextContainer,
    ViolatingRulesTextView,
} from "@/styles/View.styles";
import * as React from "react";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const HouseRules = ({
    route,
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.HouseRules>) => {
    const forceWaitSeconds = route.params?.forceWaitSeconds ?? 5;

    return (
        <OPageColorContainer>
            <RuleItem
                title={i18n.t(TR.houseRules.titleRespectful)}
                description={i18n.t(TR.houseRules.descrRespectful)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleAcceptNo)}
                description={i18n.t(TR.houseRules.descrAcceptNo)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleAuthentic)}
                description={i18n.t(TR.houseRules.descrAuthentic)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleWaitWeird)}
                description={i18n.t(TR.houseRules.descrWaitWeird)}
            />
            <RuleItem
                title={i18n.t(TR.houseRules.titleDontRush)}
                description={i18n.t(TR.houseRules.descrDontRush)}
            />

            <ButtonContainer>
                <OButtonWide
                    text={i18n.t(TR.iUnderstand)}
                    filled={true}
                    variant="light"
                    countdownEnableSeconds={forceWaitSeconds}
                    onPress={() =>
                        navigation.navigate(
                            route.params.nextPage,
                            route.params.propsForNextScreen,
                        )
                    }
                />

                <ViolatingRulesTextView>
                    <StyledText.Small>
                        {i18n.t(TR.violatingRules.p1)}
                        <StyledText.Small bold>
                            {i18n.t(TR.violatingRules.duration)}
                        </StyledText.Small>
                        {i18n.t(TR.violatingRules.p2)}
                    </StyledText.Small>
                </ViolatingRulesTextView>
            </ButtonContainer>
        </OPageColorContainer>
    );
};

interface IRuleItemProps {
    title: string;
    description: string;
}

const RuleItem: React.FC<IRuleItemProps> = ({ title, description }) => (
    <RuleItemContainer>
        <StyledMaterialIcon name="check" size={24} color="white" />
        <RuleTextContainer>
            <StyledText.Large white noMargin>
                {title}
            </StyledText.Large>
            <StyledText.Small>{description}</StyledText.Small>
        </RuleTextContainer>
    </RuleItemContainer>
);

export default HouseRules;
