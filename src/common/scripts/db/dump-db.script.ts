import { spawn } from 'child_process';
import * as fs from 'fs';
import * as fs_promises from 'fs/promises';
import * as path from 'path';
import { injectableDotEnvironment } from '../../util';
import { DbTypeConstant } from '../constant';
import {
  getDbUserPassword,
  handleEnvironmentVariables,
  parseConnectionString,
  printLogError,
  printLogSuccess,
  printLogVerbose,
} from '../util';

const env = process.env.NODE_ENV;
injectableDotEnvironment(env);

interface DumpCommand {
  command: string;
  args: string[];
  envVars: Record<string, string>;
}

async function buildDumpCommand(
  dbType: string,
  user: string,
  password: string,
  host: string,
  port: string,
  db: string,
  env: string,
): Promise<DumpCommand> {
  const backupDir = path.join(process.cwd(), `./backup/${env}`);
  if (!fs.existsSync(backupDir)) {
    await fs_promises.mkdir(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = `${backupDir}/${timestamp}`;

  if (dbType === DbTypeConstant.MYSQL) {
    return {
      command: 'mysqldump',
      args: ['-h', host, '-P', port, '-u', user, `-p${password}`, db],
      envVars: {},
    };
  } else if (dbType === DbTypeConstant.POSTGRES) {
    return {
      command: 'pg_dump',
      args: [
        '-h',
        host,
        '-p',
        port,
        '-U',
        user,
        '-d',
        db,
        '-F',
        'c',
        '-f',
        `${backupPath}.dump`,
      ],
      envVars: { PGPASSWORD: password },
    };
  } else {
    printLogError('Unsupported Database type.');
    process.exit(1);
  }
}

function executeDumpCommand({ command, args, envVars }: DumpCommand) {
  printLogVerbose(`Running: ${command} ${args.join(' ')}`);

  const child = spawn(command, args, {
    env: { ...process.env, ...envVars },
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    printLogError(`Backup failed: ${err.message}`);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      printLogSuccess(`The ${env} environment database backup is complete!`);
    } else {
      printLogError(`Backup failed with exit code ${code}`);
    }
  });
}

async function main() {
  handleEnvironmentVariables();

  const userPassword = getDbUserPassword(process.env.DB_USER_PASSWORD);
  const connectionString = process.env.DB_CONNECTION_STRING.replace(
    '${db-user-password}',
    userPassword,
  );

  const { dbType, user, password, host, port, db } =
    parseConnectionString(connectionString);

  const dumpCommand = await buildDumpCommand(
    dbType,
    user,
    password,
    host,
    port,
    db,
    env,
  );

  executeDumpCommand(dumpCommand);
}

main();
