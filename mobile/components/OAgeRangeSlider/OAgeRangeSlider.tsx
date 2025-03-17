import { Color } from "@/GlobalStyles";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AgeRangeSliderProps {
    onChange?: (range: number[]) => void;
    value: number[];
    showValues?: boolean;
}

const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({
    onChange,
    value,
    showValues,
}) => {
    const [ageRange, setAgeRange] = useState(value);

    const onValuesChange = (values: number[]) => {
        setAgeRange(values);
        onChange && onChange(values);
    };

    return (
        <View style={styles.container}>
            {showValues && (
                <Text
                    style={styles.ageText}
                >{`${ageRange[0]} - ${ageRange[1]}`}</Text>
            )}
            <MultiSlider
                onValuesChange={onValuesChange}
                isMarkersSeparated={true}
                min={18}
                max={100}
                values={value}
                selectedStyle={{ backgroundColor: Color.primary }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
    },
    ageText: {
        fontSize: 16,
        color: "#7f8c8d",
    },
});

export default AgeRangeSlider;
