'use strict';

const net = require('net');

const DEFAULT_PORT = 9051;
const DEFAULT_HOST = 'localhost';
const DEFAULT_PASSWORD = '';

const STATUS_CODES = {
  OK: 250,
};

function prepareConnectOptions(options = {}) {
  const connectOptions = {};
  if (options.path) {
    connectOptions.path = options.path;
  } else {
    connectOptions.port = options.port || DEFAULT_PORT;
    connectOptions.host = options.host || DEFAULT_HOST;
  }
  connectOptions.password = options.password || DEFAULT_PASSWORD;
  return connectOptions;
}

function isStatusOk(message) {
  return Number(message.substr(0, 3)) === STATUS_CODES.OK;
}

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

function authenticate(connection, password) {
  return new Promise((resolve, reject) => {
    connection.once('data', (data) => {
      return isStatusOk(data.toString()) ?
        resolve(connection) :
        reject(`Authentication failed with message: ${data}`);
    });
    connection.write(`AUTHENTICATE "${password}"\r\n`);
  });
}

function connect(options) {
  const connectOptions = prepareConnectOptions(options);
  return authenticate(net.connect(connectOptions), connectOptions.password);
}

module.exports = {
  prepareConnectOptions,
  isStatusOk,
  disconnect,
  authenticate,
  connect,
};

