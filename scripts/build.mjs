
import cpx from 'cpx';
import esbuild from 'esbuild';
import fse from 'fs-extra';
import { each } from 'lodash-es';
import yargs from 'yargs/yargs';

import copyConfig from '../copy.config.mjs';
import esbuildConfig from '../esbuild.config.mjs';
import { log } from '../lib/logging.mjs';


const clean = async () => {
  fse.emptyDirSync('./pub');
  log.debug('Build :: pub cleaned');
};


const compile = async ({ watch } = {}) => {

  const logResult = result => {
    log.debug('Build :: source compiled');
    if (result.warnings?.[0]) log.warn(`Build :: warnings:\n${result.warnings.join('\n')}`);
  };

  esbuildConfig.plugins = [
    ...(esbuildConfig.plugins || []),
    {
      name: 'logging',
      setup: build => {
        // onStart?  onError?
        build.onEnd(logResult);
      },
    },
  ];

  if (watch) {
    const ctx = await esbuild.context(esbuildConfig);
    await ctx.watch();
  }
  else {
    await esbuild.build(esbuildConfig);
  }
};


const copy = async ({ watch } = {}) => {

  if (watch) {
    let isInitialCopy = true;
    const promises = [];
    each(copyConfig.rules, rule => {
      promises.push(new Promise(resolve => {
        const { from, to, options } = rule;
        const watchEvents = cpx.watch(from, to, options);
        watchEvents.on('watch-ready', () => {
          // log.debug('Build :: initial source copied:', from);
          resolve();
        });
        watchEvents.on('copy', e => {
          if (!isInitialCopy) log.debug('Build :: source copied:', e.srcPath);
        });
      }));
    });
    await Promise.all(promises);
    isInitialCopy = false;
    log.debug('Build :: source copied');
  }
  else {
    const promises = [];
    each(copyConfig.rules, rule => {
      promises.push(new Promise(resolve => {
        const { from, to, options } = rule;
        cpx.copy(from, to, options, resolve);
      }));
    });
    await Promise.all(promises);
    log.debug('Build :: source copied');
  }
};


const main = async () => {

  const config = yargs(process.argv.slice(2)).parse();

  await clean();
  compile(config);
  copy(config);
};


main();
