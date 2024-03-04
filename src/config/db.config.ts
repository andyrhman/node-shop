import { DataSource } from "typeorm";

const myDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    logging: false,
    synchronize: process.env.NODE_ENV === 'development',
    migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
    migrationsTableName: 'migrations',
    entities: ["src/entity/*.ts"],
    // ssl: true,
    // entities: [
    //     "src/entity/*.ts"
    // ],
    // synchronize: true,
});

export default myDataSource;