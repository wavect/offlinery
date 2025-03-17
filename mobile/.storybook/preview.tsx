import { FORCE_RE_RENDER } from "@storybook/core-events";
import { addons } from "@storybook/preview-api";
import type { Preview } from "@storybook/react";
import { useEffect } from "react";
import { CreateUserDTOPreferredLanguageEnum } from "../api/gen/src";
import { i18n } from "../localization/translate.service";
import React = require("react");

const preview: Preview = {
    argTypes: {
        locale: {
            description: "Localization of components",
            name: "Language",
            type: "string",
            options: [
                CreateUserDTOPreferredLanguageEnum.en,
                CreateUserDTOPreferredLanguageEnum.de,
            ],
            control: { type: "select" },
        },
    },
    args: {
        locale: CreateUserDTOPreferredLanguageEnum.en,
    },
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                i18n.locale =
                    context.args.locale ||
                    CreateUserDTOPreferredLanguageEnum.en;
                addons.getChannel().emit(FORCE_RE_RENDER);
            }, [context.args.locale]);

            return (
                <React.Suspense fallback={<div>loading translations...</div>}>
                    {story()}
                </React.Suspense>
            );
        },
    ],
};

export default preview;
