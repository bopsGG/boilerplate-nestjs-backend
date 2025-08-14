import { execSync } from 'child_process';
import * as fs from 'fs';
import { getOsPlatForm, injectableDotEnvironment } from '../util';

const env = process.env.NODE_ENV;
injectableDotEnvironment(env);

const distPath = 'dist';
const isRootUser = process.env.APP_IS_ROOT_USER === 'true' ? 'sudo' : '';
const os = getOsPlatForm();

if (fs.existsSync(distPath)) {
  if (os === 'linux') {
    execSync(`${isRootUser} rm -rf dist`);
  } else {
    execSync(`yarn run rimraf dist`);
  }
}
