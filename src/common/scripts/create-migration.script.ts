import { spawn } from 'child_process';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const createMigration = () => {
  rl.question('Enter the name of your migration: ', (name) => {
    if (!name) {
      console.error('❌ Migration name is required!');
      rl.close();
      process.exit(1);
    }

    const filePath = path.join('src', 'migrations', name);

    const child = spawn('npx', ['typeorm', 'migration:create', filePath], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'local',
        TZ: 'Asia/Bangkok',
      },
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Migration created successfully.');
      } else {
        console.error(`❌ Migration failed with exit code ${code}`);
      }
      rl.close();
    });
  });
};

createMigration();
