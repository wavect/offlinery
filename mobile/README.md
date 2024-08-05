# New packages
Always install new packages with `npx expo install {package}` NOT with pnpm, yarn or npm directly.

## Can't reach backend?
Make sure the `BASE_PATH` in `api/gen/`is set properly.

## Weird AppEntry errors
Run `pnpm install:all`