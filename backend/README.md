# OpenAPI
Globally install `npm i -g @openapitools/openapi-generator-cli`

# Migrations
1. Commit/Push your changes to Github. 
2. Checkout the `main` branch and run it locally. Due to `synchronize` the db schema will be reverted. 
3. Checkout your new branch again and **don't** run the backend yet (make sure to stop the service before due to hot reload).
4. Temporarily change `synchronize: IS_DEV_MODE,` to `synchronize: false,` which mimics a production setting in `typeorm.config.ts`.
5. Run with your usual **development** command, e.g. `pnpm start:devwin` (windows) or `pnpm start:dev`.
6. This run will fail (expected) as the schema is not up-to-date.
7. Create new migration `pnpm typeorm -d ./src/datasource.ts migration:generate ./src/migrations/YOUR_MIGRATION_NAME`
8. Revert changes from No. 4 (synchronize back to `IS_DEV_MODE`)
9. Migrations are then run automatically via `migrationsRun: true` in `app.module.ts` in production settings.
10. Make sure to push your new migration file to your branch.