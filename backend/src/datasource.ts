const { DataSource } = require("typeorm");
const dotenv = require("dotenv");
dotenv.config();

const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    autoLoadEntities: true,
    migrationsRun: true,
    migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
    logging: ["error", "schema", "warn", "info"],
});

module.exports = dataSource;
