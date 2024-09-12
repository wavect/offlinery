import { TR, i18n } from "@/localization/translate.service";
import React, { FC, useRef, useState } from "react";
import { DimensionValue } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import {
    CalendlyEvent,
    IframeTitle,
    LoadingSpinner,
    PageSettings,
    Prefill,
    Utm,
    formatCalendlyUrl,
} from "./OCalendlyBase";
import styles from "./OCalendlyInline.styles";
import CalendlyLoadingSpinner from "./OCalendlyLoadingSpinner";

export interface Props {
    url: string;
    prefill?: Prefill;
    utm?: Utm;
    styles?: React.CSSProperties | undefined;
    pageSettings?: PageSettings;
    iframeTitle?: IframeTitle;
    LoadingSpinner?: LoadingSpinner;
    onEventScheduled?: (event: any) => void;
    onDateAndTimeSelected?: (event: any) => void;
    onEventTypeViewed?: (event: any) => void;
    onProfilePageViewed?: (event: any) => void;
    onPageHeight?: (event: any) => void;
}

const OCalendlyInline: FC<Props> = ({
    url,
    prefill,
    utm,
    pageSettings,
    iframeTitle,
    LoadingSpinner = CalendlyLoadingSpinner,
    onEventScheduled,
    onDateAndTimeSelected,
    onEventTypeViewed,
    onProfilePageViewed,
    onPageHeight,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [webViewHeight, setWebViewHeight] = useState<DimensionValue>();
    const webViewRef = useRef<WebView>(null);

    // @dev This one might be more native/cleaner, but doesn't work for the Calendly events (except of PageHeight somehow)
    const injectedJavaScript = `
    (function() {
      window.addEventListener('message', function(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify(e.data));
      });
      window.addEventListener('submit', event => {
                window.ReactNativeWebView.postMessage(JSON.stringify({event: event.type,payload:event}));
            });
      true;
    })();
  `;

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            switch (data.event) {
                /** @dev Calendly is not correctly emitting the events except of PageHeight, for that reason we also just listen to "submit" */
                case "submit" || CalendlyEvent.EVENT_SCHEDULED:
                    onEventScheduled?.(data.payload);
                    break;
                case CalendlyEvent.DATE_AND_TIME_SELECTED:
                    onDateAndTimeSelected?.(data.payload);
                    break;
                case CalendlyEvent.EVENT_TYPE_VIEWED:
                    onEventTypeViewed?.(data.payload);
                    break;
                case CalendlyEvent.PROFILE_PAGE_VIEWED:
                    onProfilePageViewed?.(data.payload);
                    break;
                case CalendlyEvent.PAGE_HEIGHT:
                    setWebViewHeight(
                        parseInt(data.payload.height.replace("px", "")),
                    );
                    onPageHeight?.(data.payload);
                    break;
            }
        } catch (error) {
            console.error("Failed to parse WebView message:", error);
        }
    };

    const src = formatCalendlyUrl({
        url,
        pageSettings,
        prefill,
        utm,
        embedType: "Inline",
    });

    return (
        <>
            {isLoading && <LoadingSpinner />}
            <WebView
                ref={webViewRef}
                style={[styles.webView, { height: webViewHeight }]}
                source={{ uri: src }}
                originWhitelist={["*"]}
                onLoadEnd={() => setIsLoading(false)}
                injectedJavaScript={injectedJavaScript}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error("WebView error: ", nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error("WebView HTTP error: ", nativeEvent);
                }}
                title={iframeTitle || i18n.t(TR.calendlySchedulingPageDefault)}
            />
        </>
    );
};

export default OCalendlyInline;
