require('dotenv').config();
import { DataSource } from "typeorm";

const seederSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: true,
    entities: [
        "src/entity/*.ts"
    ],
    logging: false,
    synchronize: true
});

export default seederSource;