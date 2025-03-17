import { i18n, TR } from "@/localization/translate.service";
import { sendEmail } from "@/utils/email";
import { SUPPORT_MAIL } from "@/utils/general.constants";
import * as Sentry from "@sentry/react-native";
import * as QuickActions from "expo-quick-actions";
import { useQuickActionCallback } from "expo-quick-actions/hooks";
import { useEffect } from "react";
import { Platform } from "react-native";

enum EQuickAction {
    DO_NOT_DELETE = "do_not_delete",
}

export const useQuickAction = () => {
    useEffect(() => {
        QuickActions.isSupported()
            .then((isSupported) => {
                if (isSupported) {
                    QuickActions.setItems([
                        {
                            title: i18n.t(TR.quickActionDontDeleteMeTitle),
                            subtitle: i18n.t(
                                TR.quickActionDontDeleteMeSubTitle,
                            ),
                            icon:
                                Platform.OS === "ios"
                                    ? "symbol:questionmark.circle"
                                    : "help_icon",
                            id: EQuickAction.DO_NOT_DELETE,
                            // params: { href: `/${EQuickAction.DO_NOT_DELETE}` }, // @dev href param requires useQuickActionRouting
                        },
                    ]);
                }
            })
            .catch((err) => {
                Sentry.captureException(err, {
                    tags: {
                        quickActionsSupported:
                            "notAbleToCheckQuickActionSupport",
                    },
                });
            });
    }, []);
    // useQuickActionRouting(); // @dev only works with expo router

    useQuickActionCallback((action) => {
        switch (action.id) {
            case EQuickAction.DO_NOT_DELETE:
                // TODO: Show feedback modal, explainer, etc., for now just email
                sendEmail(
                    SUPPORT_MAIL,
                    i18n.t(TR.quickActionDontDeleteMeEmailSubject),
                    i18n.t(TR.quickActionDontDeleteMeEmailBody),
                );
                break;
        }
    });
};
