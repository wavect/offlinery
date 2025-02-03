import * as SplashScreen from "expo-splash-screen";
import StorybookUIRoot from "./.storybook";
import AppRoot from "./AppRoot";

const isStorybookRun = true;
if (isStorybookRun) {
    // @dev Hide splashscreen as nothing externally to load for storybook
    SplashScreen.hideAsync();
}

export default isStorybookRun ? StorybookUIRoot : AppRoot;
