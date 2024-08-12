# Get started
Install `Expo Go` on your smart phone. This allows you to conveniently run your app. Since we already use native plugins we can't really use the web app version.

## New packages
Always install new packages with `npx expo install {package}` NOT with pnpm, yarn or npm directly.

### Weird AppEntry errors
Run `pnpm install:all`

## Backend
### Can't reach backend?
Make sure the `BASE_PATH` in `api/gen/`is set properly.

### Production
The production backend is deployed on the free tier on render.com once you push to `main`.





