# OpenAPI
Globally install `npm i -g @openapitools/openapi-generator-cli`

# Migrations
1. Create new migration `pnpm migration:generate -- --name=YOUR_MIGRATION_NAME`
2. Migrations are run automatically via `migrationsRun: true` in `app.module.ts`