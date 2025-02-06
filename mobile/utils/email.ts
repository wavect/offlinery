import * as Sentry from "@sentry/react-native";
import { Linking } from "react-native";

export const sendEmail = (
    recipient: string,
    subject?: string,
    body?: string,
) => {
    const url = `mailto:${recipient}?subject=${encodeURIComponent(subject ?? "")}&body=${encodeURIComponent(body ?? "")}`;

    Linking.openURL(url).catch((err) => {
        console.error("Error opening mail:", err);
        Sentry.captureException(err, {
            tags: {
                sendEmail: "openingMail",
            },
        });
    });
};
