#!/usr/bin/env node
import { exec } from 'child_process';
import process from 'process';
import util from 'util';
import fs from 'fs';
import readline from 'readline';
import co from 'co';
import dependencies from './deps.json';

const startTime = process.hrtime();

const execP = util.promisify(exec);
const statP = util.promisify(fs.stat);
const projectName: string = process.argv[2];

const initProject = async () => {
  try {
    await statP(`./${projectName}`);
  } catch (e) {
    await execP(`mkdir ${projectName} && cd ${projectName} && yarn init -y`);
    process.stdout.write('Create directory!\r');
    return true;
  }

  return false;
};

function* installModules() {
  for (const type in dependencies) {
    const isDev = type === 'dev';
    let modules: string = '';

    for (const moduleName in (dependencies as any)[type]) {
      modules += (modules ? ' ' : '') + moduleName;
    }

    yield execP(`yarn add ${modules} ${isDev ? '-D' : ''}`, {
      cwd: `./${projectName}`,
    });
  }
}

const main = async () => {
  const isInitialized: boolean = await initProject();

  if (isInitialized) {
    await co(installModules);
  }

  const [seconds] = process.hrtime(startTime);

  readline.clearLine(process.stdout, 0);
  process.stdout.write(`🦄 Done! ${seconds}s\n`);
};

main();
