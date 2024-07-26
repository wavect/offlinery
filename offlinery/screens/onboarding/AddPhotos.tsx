import * as React from "react";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";

const AddPhotos = ({navigation}) => {

    return <OPageContainer title="Add photos"
                           bottomContainerChildren={<OButtonWide text="Continue" filled={true} variant="dark"
                                                                  onPress={() => navigation.navigate(ROUTES.HouseRules, {
                                                                      nextPage: ROUTES.Onboarding.ApproachChoice
                                                                  })}/>}
                           subtitle="Hold, drag and drop to reorder.">
        <></>
    </OPageContainer>
};

export default AddPhotos;