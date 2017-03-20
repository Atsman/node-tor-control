'use strict';

const tor = require('./tor');
const network = require('./network');
const { connect, disconnect } = require('./connection');

module.exports = {
  tor,
  network,
  connect,
  disconnect,
};

