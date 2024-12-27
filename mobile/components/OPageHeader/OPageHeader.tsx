import { Title } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface IOPagerHeaderProps {
    title: string;
    onHelpPress?: () => void;
}

export const OPageHeader = ({ title, onHelpPress }: IOPagerHeaderProps) => {
    return (
        <View style={styles.container}>
            <Text style={Title}>{title}</Text>
            {onHelpPress && (
                <TouchableOpacity onPress={onHelpPress}>
                    <MaterialIcons
                        name="help-outline"
                        size={20}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: "row", marginLeft: 12 },
    icon: { color: "#999", padding: 6, paddingTop: 16 },
});
