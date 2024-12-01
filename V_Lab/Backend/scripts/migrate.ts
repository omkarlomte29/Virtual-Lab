import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, poolConnection } from '../src/config/db';

async function main() {

    // This will run migrations on the database, skipping the ones already applied
    await migrate(db, { migrationsFolder: "./migration" });

    // Don't forget to close the connection, otherwise the script will hang

    await poolConnection.end();
}
main()