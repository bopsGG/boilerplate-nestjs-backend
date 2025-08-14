import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
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

interface RestoreCommand {
  command: string;
  args: string[];
  envVars: Record<string, string>;
  inputFile?: string; // For MySQL stdin input
}

async function buildRestoreCommand(
  dbType: string,
  user: string,
  password: string,
  host: string,
  port: string,
  db: string,
  backupFilePath: string,
): Promise<RestoreCommand> {
  if (dbType === DbTypeConstant.MYSQL) {
    return {
      command: 'mysql',
      args: ['-h', host, '-P', port, '-u', user, `-p${password}`, db],
      envVars: {},
      inputFile: backupFilePath,
    };
  } else if (dbType === DbTypeConstant.POSTGRES) {
    return {
      command: 'pg_restore',
      args: [
        '-h',
        host,
        '-p',
        port,
        '-U',
        user,
        '-d',
        db,
        '-c',
        backupFilePath,
      ],
      envVars: { PGPASSWORD: password },
    };
  } else {
    printLogError('Unsupported Database type.');
    process.exit(1);
  }
}

function executeRestoreCommand({
  command,
  args,
  envVars,
  inputFile,
}: RestoreCommand) {
  printLogVerbose(`Running: ${command} ${args.join(' ')}`);

  const child = spawn(command, args, {
    env: { ...process.env, ...envVars },
    stdio: inputFile ? ['pipe', 'inherit', 'inherit'] : 'inherit',
  });

  if (inputFile) {
    const stream = fs.createReadStream(inputFile);
    stream.pipe(child.stdin!);
  }

  child.on('error', (err) => {
    printLogError(`Restore failed: ${err.message}`);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      printLogSuccess('Database restore completed successfully!');
    } else {
      printLogError(`Restore failed with exit code ${code}`);
    }
  });
}

async function main(backupFilePath: string) {
  handleEnvironmentVariables();

  const userPassword = getDbUserPassword(process.env.DB_USER_PASSWORD);
  const connectionString = process.env.DB_CONNECTION_STRING.replace(
    '${db-user-password}',
    userPassword,
  );

  const { dbType, user, password, host, port, db } =
    parseConnectionString(connectionString);

  const restoreCommand = await buildRestoreCommand(
    dbType,
    user,
    password,
    host,
    port,
    db,
    backupFilePath,
  );

  executeRestoreCommand(restoreCommand);
}

async function askSelectBackupFile(): Promise<string> {
  const backupDir = path.join(process.cwd(), `./backup/${env}`);
  if (!fs.existsSync(backupDir)) {
    printLogError(`Backup directory not found: ${backupDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith('.sql') || file.endsWith('.dump'));

  if (files.length === 0) {
    printLogError('No backup files found.');
    process.exit(1);
  }

  printLogVerbose('Select a backup version:\n');
  files.forEach((file, i) => {
    printLogVerbose(`[${i + 1}] ${file}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\nEnter the number of the version to restore: ', (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;

      if (isNaN(index) || index < 0 || index >= files.length) {
        printLogError('Invalid selection.');
        process.exit(1);
      }

      const selectedFile = path.join(backupDir, files[index]);
      resolve(selectedFile);
    });
  });
}

(async () => {
  const selectedBackupPath = await askSelectBackupFile();
  await main(selectedBackupPath);
})();
