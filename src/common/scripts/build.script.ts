import { execSync } from 'child_process';
import { getOsPlatForm, injectableDotEnvironment } from '../util';

const env = process.env.NODE_ENV;
injectableDotEnvironment(env);

const isRootUser = process.env.APP_IS_ROOT_USER === 'true' ? 'sudo' : '';
const os = getOsPlatForm();

if (os === 'linux') {
  execSync(`${isRootUser} yarn run tsc && ${isRootUser} yarn run copy:assets`);
} else {
  execSync('tsc && yarn run copy:assets');
}
