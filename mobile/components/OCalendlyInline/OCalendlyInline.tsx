import * as React from "react";
import {
    PageSettings,
    Prefill,
    Utm,
    IframeTitle,
    formatCalendlyUrl,
    LoadingSpinner,
} from "./OCalendlyBase";
import CalendlyLoadingSpinner from "./OCalendlyLoadingSpinner";
import styles from './OCalendlyInline.styles'
import { WebView } from 'react-native-webview';
import {Text} from "react-native";

export interface Props {
    url: string;
    prefill?: Prefill;
    utm?: Utm;
    styles?: React.CSSProperties | undefined;
    pageSettings?: PageSettings;
    iframeTitle?: IframeTitle;
    LoadingSpinner?: LoadingSpinner;
}

class InlineWidget extends React.Component<Props, { isLoading: boolean }> {

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
        };

        this.onLoadEnd = this.onLoadEnd.bind(this);
    }

    private onLoadEnd() {
        this.setState({
            isLoading: false,
        });
    }

    render() {
        const src = formatCalendlyUrl({
            url: this.props.url,
            pageSettings: this.props.pageSettings,
            prefill: this.props.prefill,
            utm: this.props.utm,
            embedType: "Inline",
        });
        const LoadingSpinnerComponent = this.props.LoadingSpinner || CalendlyLoadingSpinner;

        return <>
                {this.state.isLoading && <LoadingSpinnerComponent />}
                <WebView
                    style={styles.webView}
                    originWhitelist={['*']}
                    title={this.props.iframeTitle || "Calendly Scheduling Page"}
                    onLoadEnd={this.onLoadEnd}
                    source={{ uri: src }}
                />
            </>
    }
}

export default InlineWidget;
