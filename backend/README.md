# OpenAPI
Globally install `npm i -g @openapitools/openapi-generator-cli`

# Migrations
1. Create new migration `npx typeorm migration:generate -d src/migrations -n MigrationName`
2. Migrations are run automatically via `migrationsRun: true` in `app.module.ts`