export const defineEnvForTests = () => {
    process.env = {
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USER: "user",
        DB_PASSWORD: "password",
        DB_DATABASE: "database",
        JWT_SECRET: "secret",
        EMAIL_HOST: "smtp.example.com",
        EMAIL_USERNAME: "user@example.com",
        EMAIL_PASSWORD: "emailpassword",
        BE_PORT: "3000",
    };
};
