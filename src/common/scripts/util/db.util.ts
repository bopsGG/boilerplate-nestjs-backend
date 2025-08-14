import * as fs from 'fs';
import { injectableDotEnvironment } from '../../util';
import { printLogError } from './print-logs.util';

const env = process.env.NODE_ENV || 'development';
injectableDotEnvironment(env);

export function handleEnvironmentVariables() {
  if (!process.env.DB_USER_PASSWORD) {
    printLogError('DB_USER_PASSWORD is not set.');
    process.exit(1);
  }
  if (!process.env.DB_CONNECTION_STRING) {
    printLogError('DB_CONNECTION_STRING is not set.');
    process.exit(1);
  }
}

export function getDbUserPassword(filePath: string): string {
  try {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  } catch (error: any) {
    printLogError(`Failed to read user password file: ${error.message}`);
    process.exit(1);
  }
}

export function parseConnectionString(connectionString: string): {
  dbType: string;
  user: string;
  password: string;
  host: string;
  port: string;
  db: string;
} {
  try {
    const url = new URL(connectionString);

    const dbType = url.protocol.replace(':', '');
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port;
    const db = url.pathname.replace(/^\//, '');

    if (!dbType || !user || !password || !host || !port || !db) {
      throw new Error('Missing required connection string fields.');
    }

    return { dbType, user, password, host, port, db };
  } catch (err) {
    printLogError(`Invalid connection string format: ${err.message}`);
    process.exit(1);
  }
}
