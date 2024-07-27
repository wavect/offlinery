import {Text, View} from "react-native";
import { Tabs } from 'expo-router';
import {Subtitle, Title} from "../../GlobalStyles";
import * as React from "react";
import styles from './OPageTabContainer.styles'
import {MaterialIcons} from "@expo/vector-icons";

interface IOPageTabContainerProps {
    title: string
    subtitle?: string|React.ReactNode
    children: React.ReactNode
    bottomContainerChildren?: React.ReactNode
}

export const OPageTabContainer = (props: IOPageTabContainerProps) => {
    return  <View style={styles.container}>
        <View style={styles.content}>
            <Text style={Title}>{props.title}</Text>
            {props.subtitle && <Text style={Subtitle}>
                {props.subtitle}
            </Text>}
            {props.children}
        </View>

        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home" color={color} />,
                }}
            />
        </Tabs>
    </View>
}
