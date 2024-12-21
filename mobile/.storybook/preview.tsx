import type { Preview } from "@storybook/react";
import { useEffect } from "react";
import { i18n } from "../localization/translate.service";
import React = require("react");

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        i18n: {
            provider: ({ children, locale }) => {
                // Wrap with useEffect to change the language when locale changes
                return (
                    <React.Suspense
                        fallback={<div>loading translations...</div>}
                    >
                        {useEffect(() => {
                            i18n.locale = locale;
                        }, [locale])}
                        {children}
                    </React.Suspense>
                );
            },
            providerProps: {},
            supportedLocales: ["en", "de"], // List of supported locales
            providerLocaleKey: "locale",
        },
    },
};

export default preview;
