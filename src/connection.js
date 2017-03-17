'use strict';

const net = require('net');
const { STATUS, parseReply } = require('./reply');

const DEFAULT_PORT = 9051;
const DEFAULT_HOST = 'localhost';
const DEFAULT_PASSWORD = '';

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

    return connection.write('QUIT\r\n');
  });
}

/*
 * Authenticates connection
 * @function authenticate
 * @param {Object} connection
 * @param {String} password
 * @returns {Promise}
 */
function authenticate(connection, password = DEFAULT_PASSWORD) {
  return new Promise((resolve, reject) => {
    connection.once('data', (data) => {
      const message = parseReply(data.toString());
      return message.code === STATUS.OK
        ? resolve(connection)
        : reject(`Authentication failed with message: ${data}`);
    });
    connection.write(`AUTHENTICATE "${password}"\r\n`);
  });
}

function connect(options = {}) {
  return authenticate(
    net.connect(prepareConnectOptions(options)),
    options.password
  );
}

module.exports = {
  prepareConnectOptions,
  disconnect,
  authenticate,
  connect,
};

