'use strict';

const net = require('net');
const { authenticate, quit } = require('./tor');

const DEFAULT_PORT = 9051;
const DEFAULT_HOST = 'localhost';

/*
 * Prepares connection options. Adds defaults values.
 * @function prepareConnectOptions
 * @param {Object} options - connect options
 * @returns {Object}
 */
function prepareConnectOptions(options = {}) {
  const connectOptions = {};
  if (options.path) {
    connectOptions.path = options.path;
  } else {
    connectOptions.port = options.port || DEFAULT_PORT;
    connectOptions.host = options.host || DEFAULT_HOST;
  }
  return connectOptions;
}

/*
 * Disconnects from tor control.
 * @function disconnect
 * @param {Object} connection
 * @param {Boolean} force
 * @returns {Promise}
 */
function disconnect(connection, force = false) {
  return new Promise((resolve) => {
    connection.once('end', () => {
      resolve();
    });

    if (force) {
      return connection.end();
    }

    return quit(connection);
  });
}


async function connect(options = {}) {
  const connection = net.connect(prepareConnectOptions(options));
  await authenticate(connection, options.password);
  return connection;
}

module.exports = {
  prepareConnectOptions,
  disconnect,
  connect,
};

