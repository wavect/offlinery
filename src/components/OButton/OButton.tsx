import "./OButton.css"
import {FC} from "react";
import {IonButton} from "@ionic/react";

interface IOButtonProps {
    fill?: "outline"|"solid";
    shape?: "round";
    expand?: "block";
    text: string;
}

export const OButton: FC<IOButtonProps> = (props: IOButtonProps) => {
    const {text, fill, shape, expand} = props;
    return <>
        <IonButton expand={expand} shape={shape} fill={fill} className="buttonFullWidth">
            {text}
        </IonButton>
    </>
};