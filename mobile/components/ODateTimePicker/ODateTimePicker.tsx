import RNDateTimePicker, {
    AndroidNativeProps,
    DateTimePickerEvent,
    IOSNativeProps,
    WindowsNativeProps,
} from "@react-native-community/datetimepicker";
import * as React from "react";
import { useState } from "react";
import { Platform, Text, TextStyle } from "react-native";

export enum EDateTimeFormatters {
    TIME = "time",
    DATE = "date",
}

type IODateTimePickerProps = (
    | IOSNativeProps
    | AndroidNativeProps
    | WindowsNativeProps
) & {
    dateTimeFormatter?: EDateTimeFormatters;
    customFormatAndroidText?: (date: Date) => string;
    androidTextStyle?: TextStyle;
};

export const ODateTimePicker = (props: IODateTimePickerProps) => {
    // Android is a date/time dialog, while on iOS it kind of is embedded on the screen and still is usable if shown consistently
    const isIOS = Platform.OS === "ios";
    const [showDateTimePicker, setShowDateTimePicker] = useState(isIOS);
    const {
        androidTextStyle,
        value,
        onChange,
        customFormatAndroidText,
        dateTimeFormatter,
    } = props;
    if (!customFormatAndroidText && !dateTimeFormatter) {
        throw new Error(
            "Either customFormatAndroidText or dateTimeFormatter need to be defined. If both are defined, customFormat is used.",
        );
    }

    const onDatePickerEvent = (event: DateTimePickerEvent, date?: Date) => {
        if (!isIOS) {
            setShowDateTimePicker(!showDateTimePicker);
        }
        if (onChange) {
            onChange(event, date);
        }
    };

    const formatFunctionToUse = (date: Date): string => {
        if (customFormatAndroidText) {
            return customFormatAndroidText(date);
        }
        return {
            [EDateTimeFormatters.TIME]: (date: Date) => {
                return date.toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                });
            },
            [EDateTimeFormatters.DATE]: (date: Date) => {
                return date.toLocaleDateString(undefined, {
                    timeZone: "utc",
                });
            },
        }[dateTimeFormatter!](date);
    };

    return (
        <>
            {!isIOS && (
                <Text
                    onPress={() => setShowDateTimePicker(true)}
                    style={androidTextStyle}
                >
                    {formatFunctionToUse(value)}
                </Text>
            )}
            {showDateTimePicker && (
                <RNDateTimePicker {...props} onChange={onDatePickerEvent} />
            )}
        </>
    );
};
