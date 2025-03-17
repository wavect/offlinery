import * as Sentry from "@sentry/react-native";

export const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

export const setupSentry = (isHeadless: boolean) => {
    try {
        Sentry.init({
            dsn: "https://d8a1c81d2d3df6f95b9a54aa3ca8c08d@o4508167095451648.ingest.de.sentry.io/4508167098531920",
            debug: __DEV__,
            enabled: !__DEV__, // @dev only send events in prod
            integrations: isHeadless ? [] : [navigationIntegration],
            // uncomment the line below to enable Spotlight (https://spotlightjs.com)
            // enableSpotlight: __DEV__,
        });
    } catch (err) {
        console.error(
            "Sentry initialization failed",
            `isHeadless: ${isHeadless}`,
            err,
        );
    }
};
