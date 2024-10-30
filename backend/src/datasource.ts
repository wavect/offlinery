const { TYPED_ENV } = require("./utils/env.utils");

const { DataSource } = require("typeorm");

// Import utilities using relative paths instead of aliases
const { validateEnv } = require("./utils/env.utils");
const { IS_DEV_MODE } = require("./utils/misc.utils");

validateEnv();

const dataSource = new DataSource({
    type: "postgres",
    host: TYPED_ENV.DB_HOST,
    port: TYPED_ENV.DB_PORT,
    username: TYPED_ENV.DB_USER,
    password: TYPED_ENV.DB_PASSWORD,
    database: TYPED_ENV.DB_DATABASE,
    synchronize: IS_DEV_MODE,
    autoLoadEntities: true,
    migrationsRun: true,
    migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
    logging: ["error", "schema", "warn", "info"],
});

module.exports = dataSource;
