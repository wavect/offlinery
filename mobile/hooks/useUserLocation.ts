import * as Sentry from "@sentry/react-native";
import { useEffect, useState } from "react";
import BackgroundGeolocation, {
    Location,
    LocationAccuracy,
} from "react-native-background-geolocation";

export const useUserLocation = (desiredAccuracy?: LocationAccuracy) => {
    const [location, setLocation] = useState<Location | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const location = await BackgroundGeolocation.getCurrentPosition(
                    {
                        desiredAccuracy:
                            desiredAccuracy ??
                            BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
                    },
                );
                setLocation(location);
            } catch (error) {
                console.error("Unable to get user location.", error);
                Sentry.captureException(error, {
                    tags: {
                        map: "location",
                    },
                });
            }
        })();
    }, []);

    return location;
};
