import {KeyboardAvoidingView, Platform, ScrollView, Text, View} from "react-native";
import {Subtitle, Title} from "../../GlobalStyles";
import * as React from "react";
import styles from './OPageContainer.styles'

interface IOPageContainerProps {
    title?: string
    subtitle?: string|React.ReactNode
    children: React.ReactNode
    bottomContainerChildren?: React.ReactNode
    doNotUseScrollView?: boolean
}

export const OPageContainer = (props: IOPageContainerProps) => {
    const MainViewContainer = props.doNotUseScrollView ? View : ScrollView
    return  <View style={styles.container}>
        <MainViewContainer style={styles.content}>
            {props.title && <Text style={Title}>{props.title}</Text>}
            {props.subtitle && <Text style={Subtitle}>
                {props.subtitle}
            </Text>}
            {props.children}
        </MainViewContainer>

        <KeyboardAvoidingView style={styles.buttonContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}
                              keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 140}>
            {props.bottomContainerChildren}
        </KeyboardAvoidingView>
    </View>
}
