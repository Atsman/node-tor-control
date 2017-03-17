'use strict';

const tor = require('./tor');
const { connect, disconnect } = require('./connection');

module.exports = {
  tor,
  connect,
  disconnect,
};

