
import fse from 'fs-extra';

import { log } from '../lib/logging.mjs';


const config = {
  pubDir: './pub',
};


fse.removeSync(config.pubDir);
log.debug('Clean :: removed pub files');
