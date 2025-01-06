import { TR, i18n } from "@/localization/translate.service";
import * as Sentry from "@sentry/react-native";
import React, { FC, useRef, useState } from "react";
import { DimensionValue, Platform, View } from "react-native";
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

    // @dev On Android the pageHeight event for whatever triggers constant reloads.
    const injectedJavaScript = `
    (function() {
      window.addEventListener('message', function(e) {
      if ('${Platform.OS}' === 'android' && e.data.event === '${CalendlyEvent.PAGE_HEIGHT}') return;
        window.ReactNativeWebView.postMessage(JSON.stringify(e.data));
      });
      true;
    })();
  `;

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            switch (data.event) {
                case CalendlyEvent.EVENT_SCHEDULED:
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
            Sentry.captureException(error, {
                tags: {
                    calendly: "webView",
                },
            });
        }
    };

    const src = formatCalendlyUrl({
        url,
        pageSettings,
        prefill,
        utm,
        embedType: "Inline",
    });

    /** @dev We need to use the html prop in order to correctly emit the CalendlyScheduled event. The URI prop doesn't work.
     * The full blown html including head, etc. is necessary to have a responsive view otherwise desktop is loaded.
     * @ref https://github.com/tcampb/react-calendly/issues/190#issuecomment-2364364463
     */
    const webViewHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta http-equiv="x-dns-prefetch-control" content="on">
          <link rel="dns-prefetch" href="https://calendly.com">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              background-color: transparent;
            }
            iframe {
              border: none;
              width: 100%;
              height: 100%;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
            }
          </style>
        </head>
        <body>
          <iframe src="${src}" width="100%" height="100%" frameborder="0" allowtransparency="true"></iframe>
        </body>
      </html>
    `;

    return (
        <View style={styles.container}>
            {isLoading && <LoadingSpinner />}
            <WebView
                ref={webViewRef}
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
                style={styles.webView}
                source={{
                    html: webViewHtml,
                    baseUrl: "https://calendly.com",
                }}
                originWhitelist={["*"]}
                onLoadEnd={() => setIsLoading(false)}
                injectedJavaScript={injectedJavaScript}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                mixedContentMode="compatibility"
                bounces={false}
                webviewDebuggingEnabled={__DEV__}
                allowsBackForwardNavigationGestures={true}
                androidLayerType={
                    Platform.OS === "android" ? "hardware" : undefined
                }
                cacheEnabled={true}
                incognito={false}
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
                cacheMode="LOAD_CACHE_ELSE_NETWORK"
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn("WebView error: ", nativeEvent);
                    Sentry.captureException(nativeEvent, {
                        tags: { calendlyInline: "onError" },
                    });
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn("WebView HTTP error: ", nativeEvent);
                    Sentry.captureException(nativeEvent, {
                        tags: { calendlyInline: "onHttpError" },
                    });
                }}
                title={iframeTitle || i18n.t(TR.calendlySchedulingPageDefault)}
            />
        </View>
    );
};

export default OCalendlyInline;
