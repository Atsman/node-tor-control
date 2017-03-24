'use strict';

const assert = require('assert');
const debug = require('debug')('process');
const cp = require('child_process');

function exec(command, options = {}) {
  assert(command, 'command must be provided');
  debug('exec(%s, %s)', command, options);
  return new Promise((resolve, reject) => {
    const execOptions = Object.assign({}, options, {
      env: options.env || process.env,
      cwd: options.cwd || process.cwd,
    });

    const p = cp.exec(command, execOptions, (err, stdout, stderr) => {
      if (err) {
        return reject({ err, stdout, stderr });
      }
      return resolve(stdout);
    });
    debug('exec process started, pid: %s', p.pid);
  });
}

module.exports = {
  exec,
};

