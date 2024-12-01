import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "src/models/schema";
import "dotenv/config";

export const poolConnection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 1, // Adjust as needed
});

// @ts-ignore
export const db = drizzle(poolConnection, { schema, logger: true, mode: "default" });
