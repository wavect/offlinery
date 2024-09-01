import { UserPreferredLanguageEnum } from "@/api/gen/src";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import { de } from "./de";
import { en } from "./en";

/** @dev Use via i18n.t(ILanguage.KEY) */
const languages: Record<UserPreferredLanguageEnum, Language> = {
    en,
    de,
};
export const i18n = new I18n(languages);

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? UserPreferredLanguageEnum.en;
i18n.enableFallback = true;
i18n.defaultLocale = UserPreferredLanguageEnum.en;

/** @dev Base typing for languages, to ensure all keys have been defined */
export type Language = typeof en;

export const TR = createDeepKeyMirror(en);

/** @dev Creates a key mirror, key=value, e.g. createValue: "createValue", etc. to reference in code */
type Primitive = string | number | boolean | null | undefined;

type DeepKeyMirror<T, P extends string = ""> = {
    [K in keyof T]: T[K] extends Primitive
        ? P extends ""
            ? K
            : `${P}.${string & K}`
        : T[K] extends object
          ? DeepKeyMirror<
                T[K],
                P extends "" ? `${string & K}` : `${P}.${string & K}`
            >
          : never;
};

function createDeepKeyMirror<T extends Record<string, any>>(
    obj: T,
    parentKey: string = "",
): DeepKeyMirror<T> {
    const result: any = {};

    for (const key in obj) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
            result[key] = createDeepKeyMirror(obj[key], fullKey);
        } else {
            result[key] = fullKey;
        }
    }

    return result as DeepKeyMirror<T>;
}
