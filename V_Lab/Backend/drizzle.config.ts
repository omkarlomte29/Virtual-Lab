import { defineConfig } from 'drizzle-kit';
import "dotenv/config";

export default defineConfig({
    dialect: 'mysql', // 'postgresql' | 'mysql' | 'sqlite'
    schema: './src/models/schema.ts',
    out: './migrations',
    dbCredentials: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    },
    verbose: true,
    strict: true,
});
